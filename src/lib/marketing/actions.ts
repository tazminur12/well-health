"use server";

import { Prisma, Role, UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { AdminAuthError, requireAdmin } from "@/lib/admin/require-admin";
import { sendMarketingEmail, wrapMarketingEmailHtml } from "@/lib/email/marketing";
import {
  marketingCampaignInputSchema,
  parseRecipientList,
  type AdminMarketingCampaign,
  type MarketingAudienceStats,
  type MarketingCampaignInput,
  type MarketingChannel,
} from "@/lib/marketing/schemas";
import { prisma } from "@/lib/prisma";
import { getSmsConfigStatus, sendSmsBatch } from "@/lib/sms";

export type MarketingActionResult<T = undefined> = {
  error?: string;
  data?: T;
  success?: string;
};

function handleError<T = undefined>(error: unknown): MarketingActionResult<T> {
  if (
    error instanceof AdminAuthError ||
    (error instanceof Error && error.name === "AdminAuthError")
  ) {
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") return { error: "Campaign not found." };
  }
  console.error("Marketing action failed:", error);
  return {
    error: error instanceof Error ? error.message : "Something went wrong. Please try again.",
  };
}

function toDto(row: {
  id: string;
  name: string;
  channel: MarketingChannel;
  audience: "ALL_CUSTOMERS" | "VIP" | "CUSTOM";
  subject: string | null;
  body: string;
  customRecipients: string | null;
  status: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED";
  scheduledAt: Date | null;
  sentAt: Date | null;
  recipientCount: number;
  successCount: number;
  failureCount: number;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
}): AdminMarketingCampaign {
  return {
    id: row.id,
    name: row.name,
    channel: row.channel,
    audience: row.audience,
    subject: row.subject,
    body: row.body,
    customRecipients: row.customRecipients,
    status: row.status,
    scheduledAt: row.scheduledAt?.toISOString() ?? null,
    sentAt: row.sentAt?.toISOString() ?? null,
    recipientCount: row.recipientCount,
    successCount: row.successCount,
    failureCount: row.failureCount,
    lastError: row.lastError,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function parseOptionalDate(value?: string | null) {
  if (!value?.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function resolveRecipients(
  channel: MarketingChannel,
  audience: MarketingCampaignInput["audience"],
  customRecipients?: string | null
) {
  if (audience === "CUSTOM") {
    return parseRecipientList(customRecipients);
  }

  const where =
    audience === "VIP"
      ? { role: Role.CUSTOMER, status: UserStatus.ACTIVE, isVip: true }
      : { role: Role.CUSTOMER, status: UserStatus.ACTIVE };

  const users = await prisma.user.findMany({
    where,
    select: { email: true, phone: true },
  });

  if (channel === "EMAIL") {
    return [
      ...new Set(
        users
          .map((u) => u.email?.trim().toLowerCase())
          .filter((email): email is string => Boolean(email))
      ),
    ];
  }

  return [
    ...new Set(
      users
        .map((u) => u.phone?.trim())
        .filter((phone): phone is string => Boolean(phone) && phone !== "—")
    ),
  ];
}

export async function getMarketingMetaAction(): Promise<
  MarketingActionResult<{
    audience: MarketingAudienceStats;
    sms: ReturnType<typeof getSmsConfigStatus>;
    emailConfigured: boolean;
  }>
> {
  try {
    await requireAdmin();

    const [allCustomers, vipCustomers, withEmail, withPhone] = await Promise.all([
      prisma.user.count({ where: { role: Role.CUSTOMER, status: UserStatus.ACTIVE } }),
      prisma.user.count({
        where: { role: Role.CUSTOMER, status: UserStatus.ACTIVE, isVip: true },
      }),
      prisma.user.count({
        where: {
          role: Role.CUSTOMER,
          status: UserStatus.ACTIVE,
          email: { not: "" },
        },
      }),
      prisma.user.count({
        where: {
          role: Role.CUSTOMER,
          status: UserStatus.ACTIVE,
          NOT: { phone: null },
        },
      }),
    ]);

    const resendKey = process.env.RESEND_API_KEY?.trim();
    const emailConfigured = Boolean(resendKey && !resendKey.includes("xxxxxxxx"));

    return {
      data: {
        audience: { allCustomers, vipCustomers, withEmail, withPhone },
        sms: getSmsConfigStatus(),
        emailConfigured,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function listMarketingCampaignsAction(
  channel?: MarketingChannel
): Promise<MarketingActionResult<AdminMarketingCampaign[]>> {
  try {
    await requireAdmin();
    const rows = await prisma.marketingCampaign.findMany({
      where: channel ? { channel } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return { data: rows.map(toDto) };
  } catch (error) {
    return handleError(error);
  }
}

export async function createMarketingCampaignAction(
  input: MarketingCampaignInput
): Promise<MarketingActionResult<AdminMarketingCampaign>> {
  try {
    await requireAdmin();
    const parsed = marketingCampaignInputSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid campaign data." };
    }

    const scheduledAt = parseOptionalDate(parsed.data.scheduledAt);
    const row = await prisma.marketingCampaign.create({
      data: {
        name: parsed.data.name,
        channel: parsed.data.channel,
        audience: parsed.data.audience,
        subject: parsed.data.channel === "EMAIL" ? parsed.data.subject?.trim() || null : null,
        body: parsed.data.body,
        customRecipients:
          parsed.data.audience === "CUSTOM" ? parsed.data.customRecipients?.trim() || null : null,
        status: scheduledAt && scheduledAt > new Date() ? "SCHEDULED" : "DRAFT",
        scheduledAt,
      },
    });

    revalidatePath("/admin/marketing");
    return { data: toDto(row), success: "Campaign saved as draft." };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateMarketingCampaignAction(
  id: string,
  input: MarketingCampaignInput
): Promise<MarketingActionResult<AdminMarketingCampaign>> {
  try {
    await requireAdmin();
    const parsed = marketingCampaignInputSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid campaign data." };
    }

    const existing = await prisma.marketingCampaign.findUnique({ where: { id } });
    if (!existing) return { error: "Campaign not found." };
    if (existing.status === "SENDING" || existing.status === "SENT") {
      return { error: "Sent campaigns can’t be edited." };
    }

    const scheduledAt = parseOptionalDate(parsed.data.scheduledAt);
    const row = await prisma.marketingCampaign.update({
      where: { id },
      data: {
        name: parsed.data.name,
        channel: parsed.data.channel,
        audience: parsed.data.audience,
        subject: parsed.data.channel === "EMAIL" ? parsed.data.subject?.trim() || null : null,
        body: parsed.data.body,
        customRecipients:
          parsed.data.audience === "CUSTOM" ? parsed.data.customRecipients?.trim() || null : null,
        status: scheduledAt && scheduledAt > new Date() ? "SCHEDULED" : "DRAFT",
        scheduledAt,
        lastError: null,
      },
    });

    revalidatePath("/admin/marketing");
    return { data: toDto(row), success: "Campaign updated." };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteMarketingCampaignAction(
  id: string
): Promise<MarketingActionResult> {
  try {
    await requireAdmin();
    await prisma.marketingCampaign.delete({ where: { id } });
    revalidatePath("/admin/marketing");
    return { success: "Campaign deleted." };
  } catch (error) {
    return handleError(error);
  }
}

export async function sendMarketingCampaignAction(
  id: string
): Promise<MarketingActionResult<AdminMarketingCampaign>> {
  try {
    await requireAdmin();

    const campaign = await prisma.marketingCampaign.findUnique({ where: { id } });
    if (!campaign) return { error: "Campaign not found." };
    if (campaign.status === "SENDING") return { error: "Campaign is already sending." };
    if (campaign.status === "SENT") return { error: "Campaign was already sent." };

    if (campaign.channel === "SMS") {
      const sms = getSmsConfigStatus();
      if (!sms.configured) {
        return {
          error:
            "SMS provider is not configured yet. Add SMS_API_KEY and SMS_SENDER_ID to .env first. You can still save drafts.",
        };
      }
    }

    const recipients = await resolveRecipients(
      campaign.channel,
      campaign.audience,
      campaign.customRecipients
    );

    if (recipients.length === 0) {
      return { error: "No recipients found for this audience." };
    }

    // Safety cap for design/early integration
    const capped = recipients.slice(0, 100);

    await prisma.marketingCampaign.update({
      where: { id },
      data: { status: "SENDING", recipientCount: capped.length, lastError: null },
    });

    let successCount = 0;
    let failureCount = 0;
    let lastError: string | null = null;

    if (campaign.channel === "EMAIL") {
      const html = wrapMarketingEmailHtml(campaign.body, campaign.name);
      const subject = campaign.subject?.trim() || campaign.name;

      for (const to of capped) {
        const result = await sendMarketingEmail({ to, subject, html });
        if (result.ok) successCount += 1;
        else {
          failureCount += 1;
          lastError = result.error ?? "Email send failed";
        }
      }
    } else {
      const batch = await sendSmsBatch({ recipients: capped, message: campaign.body });
      successCount = batch.successCount;
      failureCount = batch.failureCount;
      lastError = batch.errors[0] ?? null;
    }

    const finalStatus =
      successCount > 0 && failureCount === 0
        ? "SENT"
        : successCount > 0
          ? "SENT"
          : "FAILED";

    const row = await prisma.marketingCampaign.update({
      where: { id },
      data: {
        status: finalStatus,
        sentAt: successCount > 0 ? new Date() : null,
        recipientCount: capped.length,
        successCount,
        failureCount,
        lastError:
          finalStatus === "FAILED"
            ? lastError ?? "All sends failed"
            : failureCount > 0
              ? lastError
              : null,
      },
    });

    revalidatePath("/admin/marketing");

    if (finalStatus === "FAILED") {
      return {
        data: toDto(row),
        error: lastError ?? "Campaign failed to send.",
      };
    }

    return {
      data: toDto(row),
      success:
        failureCount > 0
          ? `Sent to ${successCount} of ${capped.length} recipients (${failureCount} failed).`
          : `Campaign sent to ${successCount} recipient${successCount === 1 ? "" : "s"}.`,
    };
  } catch (error) {
    return handleError(error);
  }
}
