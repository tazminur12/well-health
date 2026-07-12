import { z } from "zod";

export const marketingChannelSchema = z.enum(["EMAIL", "SMS"]);
export const marketingAudienceSchema = z.enum(["ALL_CUSTOMERS", "VIP", "CUSTOM"]);
export const marketingStatusSchema = z.enum([
  "DRAFT",
  "SCHEDULED",
  "SENDING",
  "SENT",
  "FAILED",
]);

export const marketingCampaignInputSchema = z
  .object({
    name: z.string().trim().min(2, "Campaign name is required").max(120),
    channel: marketingChannelSchema,
    audience: marketingAudienceSchema.default("ALL_CUSTOMERS"),
    subject: z.string().trim().max(200).optional().nullable(),
    body: z.string().trim().min(1, "Message body is required").max(10000),
    customRecipients: z.string().trim().max(20000).optional().nullable(),
    scheduledAt: z.string().trim().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.channel === "EMAIL" && !data.subject?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Email subject is required",
        path: ["subject"],
      });
    }
    if (data.channel === "SMS" && data.body.length > 480) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "SMS should be 480 characters or fewer",
        path: ["body"],
      });
    }
    if (data.audience === "CUSTOM" && !data.customRecipients?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one recipient for a custom audience",
        path: ["customRecipients"],
      });
    }
  });

export type MarketingChannel = z.infer<typeof marketingChannelSchema>;
export type MarketingAudience = z.infer<typeof marketingAudienceSchema>;
export type MarketingCampaignStatus = z.infer<typeof marketingStatusSchema>;
export type MarketingCampaignInput = z.infer<typeof marketingCampaignInputSchema>;

export type AdminMarketingCampaign = {
  id: string;
  name: string;
  channel: MarketingChannel;
  audience: MarketingAudience;
  subject: string | null;
  body: string;
  customRecipients: string | null;
  status: MarketingCampaignStatus;
  scheduledAt: string | null;
  sentAt: string | null;
  recipientCount: number;
  successCount: number;
  failureCount: number;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MarketingAudienceStats = {
  allCustomers: number;
  vipCustomers: number;
  withEmail: number;
  withPhone: number;
};

export function parseRecipientList(raw: string | null | undefined) {
  if (!raw?.trim()) return [];
  return [
    ...new Set(
      raw
        .split(/[\n,;]+/)
        .map((item) => item.trim())
        .filter(Boolean)
    ),
  ];
}
