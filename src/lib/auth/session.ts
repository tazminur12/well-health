import { Prisma, Role } from "@prisma/client";

import {
  CUSTOMER_PLACEHOLDER_EMAIL_DOMAIN,
  findCustomerByPhone,
} from "@/lib/customers/sync-from-order";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: Role;
  avatarUrl: string | null;
  staffRoleName: string | null;
};

export async function getSessionUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const meta = user.user_metadata ?? {};
  const roleFromMeta = String(meta.role ?? "CUSTOMER").toUpperCase();
  const role =
    roleFromMeta === "ADMIN" || roleFromMeta === "SUPPORT"
      ? (roleFromMeta as Role)
      : Role.CUSTOMER;

  try {
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      include: { staffRole: true },
    });
    if (profile) {
      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        phone: profile.phone,
        role: profile.role,
        avatarUrl: profile.avatarUrl,
        staffRoleName: profile.staffRole?.name ?? null,
      };
    }
  } catch {
    // DB may be unavailable during early setup — fall back to auth metadata.
  }

  return {
    id: user.id,
    email: user.email,
    name: (meta.full_name as string | undefined) ?? null,
    phone: (meta.phone as string | undefined) ?? null,
    role,
    avatarUrl: (meta.avatar_url as string | undefined) ?? null,
    staffRoleName: null,
  };
}

async function adoptCustomerAccount(
  existingId: string,
  input: {
    id: string;
    email: string;
    name?: string | null;
    phone?: string | null;
  }
) {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({ where: { id: existingId } });
    if (!existing || existing.role !== Role.CUSTOMER || existing.id === input.id) return;

    await tx.user.update({
      where: { id: existingId },
      data: { email: `merged.${existingId}@${CUSTOMER_PLACEHOLDER_EMAIL_DOMAIN}` },
    });

    await tx.user.create({
      data: {
        id: input.id,
        email: input.email.trim().toLowerCase(),
        name: input.name?.trim() || existing.name,
        phone: input.phone?.trim() || existing.phone,
        role: Role.CUSTOMER,
        status: existing.status,
        isVip: existing.isVip,
        notes: existing.notes,
        avatarUrl: existing.avatarUrl,
        dateOfBirth: existing.dateOfBirth,
        gender: existing.gender,
        preferences: (existing.preferences ?? {}) as Prisma.InputJsonValue,
        createdAt: existing.createdAt,
      },
    });

    await tx.order.updateMany({ where: { userId: existingId }, data: { userId: input.id } });
    await tx.address.updateMany({ where: { userId: existingId }, data: { userId: input.id } });
    await tx.wishlistItem.updateMany({ where: { userId: existingId }, data: { userId: input.id } });
    await tx.productReview.updateMany({ where: { userId: existingId }, data: { userId: input.id } });
    await tx.blogPost.updateMany({ where: { authorId: existingId }, data: { authorId: input.id } });
    await tx.staffInvite.updateMany({
      where: { invitedById: existingId },
      data: { invitedById: input.id },
    });
    await tx.user.delete({ where: { id: existingId } });
  });
}

export async function syncUserProfile(input: {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  role?: Role;
}) {
  try {
    const email = input.email.trim().toLowerCase();
    const existingById = await prisma.user.findUnique({ where: { id: input.id } });
    if (existingById) {
      await prisma.user.update({
        where: { id: input.id },
        data: {
          email,
          name: input.name ?? undefined,
          phone: input.phone ?? undefined,
        },
      });
      return;
    }

    const existingByEmail = await prisma.user.findUnique({ where: { email } });
    const existingByPhone = input.phone ? await findCustomerByPhone(prisma, input.phone) : null;
    const existing =
      existingByEmail?.role === Role.CUSTOMER
        ? existingByEmail
        : existingByPhone?.role === Role.CUSTOMER
          ? existingByPhone
          : null;

    if (existing && existing.id !== input.id) {
      await adoptCustomerAccount(existing.id, { ...input, email });
      return;
    }

    await prisma.user.create({
      data: {
        id: input.id,
        email,
        name: input.name ?? null,
        phone: input.phone ?? null,
        role: input.role ?? Role.CUSTOMER,
      },
    });
  } catch (error) {
    console.error("Failed to sync user profile to database:", error);
  }
}
