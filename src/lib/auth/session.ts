import { Role } from "@prisma/client";

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

export async function syncUserProfile(input: {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  role?: Role;
}) {
  try {
    await prisma.user.upsert({
      where: { id: input.id },
      create: {
        id: input.id,
        email: input.email,
        name: input.name ?? null,
        phone: input.phone ?? null,
        role: input.role ?? Role.CUSTOMER,
      },
      update: {
        email: input.email,
        name: input.name ?? undefined,
        phone: input.phone ?? undefined,
      },
    });
  } catch (error) {
    console.error("Failed to sync user profile to database:", error);
  }
}
