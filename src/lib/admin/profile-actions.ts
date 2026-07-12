"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

import { AdminAuthError, requireAdmin } from "@/lib/admin/require-admin";
import {
  adminPasswordChangeSchema,
  adminProfileUpdateSchema,
  type AdminPasswordChangeInput,
  type AdminProfileUpdateInput,
} from "@/lib/admin/profile-schemas";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type AdminProfile = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  roleLabel: string;
  staffRoleName: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminProfileResult<T = undefined> = {
  error?: string;
  data?: T;
  success?: string;
};

function normalizePhone(phone?: string) {
  const trimmed = phone?.trim() ?? "";
  if (!trimmed) return null;
  const digits = trimmed.replace(/[\s-]/g, "");
  if (digits.startsWith("+880")) return digits;
  if (digits.startsWith("880")) return `+${digits}`;
  if (digits.startsWith("0")) return `+880${digits.slice(1)}`;
  if (digits.startsWith("1") && digits.length === 10) return `+880${digits}`;
  return digits;
}

function handleError<T = undefined>(error: unknown): AdminProfileResult<T> {
  if (
    error instanceof AdminAuthError ||
    (error instanceof Error && error.name === "AdminAuthError")
  ) {
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }
  console.error("Admin profile action failed:", error);
  return {
    error: error instanceof Error ? error.message : "Something went wrong. Please try again.",
  };
}

async function loadAdminProfile(userId: string): Promise<AdminProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { staffRole: true },
  });
  if (!user) return null;

  const roleLabel =
    user.staffRole?.name ??
    (user.role === "ADMIN" ? "Administrator" : user.role === "SUPPORT" ? "Support" : "Staff");

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    role: user.role,
    roleLabel,
    staffRoleName: user.staffRole?.name ?? null,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function getAdminProfileAction(): Promise<AdminProfileResult<AdminProfile>> {
  try {
    const admin = await requireAdmin();
    const profile = await loadAdminProfile(admin.id);
    if (!profile) {
      return {
        data: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          phone: admin.phone,
          avatarUrl: null,
          role: admin.role,
          roleLabel: "Administrator",
          staffRoleName: null,
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }
    return { data: profile };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateAdminProfileAction(
  input: AdminProfileUpdateInput
): Promise<AdminProfileResult<AdminProfile>> {
  try {
    const admin = await requireAdmin();
    const parsed = adminProfileUpdateSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid profile details" };
    }

    const name = parsed.data.name.trim();
    const phone = normalizePhone(parsed.data.phone);

    const supabase = await createClient();
    const { error: metaError } = await supabase.auth.updateUser({
      data: {
        full_name: name,
        phone: phone ?? "",
      },
    });
    if (metaError) {
      return { error: metaError.message };
    }

    await prisma.user.upsert({
      where: { id: admin.id },
      create: {
        id: admin.id,
        email: admin.email,
        name,
        phone,
        role: "ADMIN",
      },
      update: {
        name,
        phone,
      },
    });

    const profile = await loadAdminProfile(admin.id);
    revalidatePath("/admin/profile");
    revalidatePath("/admin", "layout");
    return { data: profile ?? undefined, success: "Profile updated successfully." };
  } catch (error) {
    return handleError(error);
  }
}

export async function changeAdminPasswordAction(
  input: AdminPasswordChangeInput
): Promise<AdminProfileResult> {
  try {
    const admin = await requireAdmin();
    const parsed = adminPasswordChangeSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid password details" };
    }

    const supabase = await createClient();
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: admin.email,
      password: parsed.data.currentPassword,
    });
    if (verifyError) {
      return { error: "Current password is incorrect." };
    }

    const { error } = await supabase.auth.updateUser({
      password: parsed.data.newPassword,
    });
    if (error) {
      return { error: error.message };
    }

    return { success: "Password updated successfully." };
  } catch (error) {
    return handleError(error);
  }
}

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

function extensionForMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

async function removeLocalAvatar(publicUrl: string | null | undefined) {
  if (!publicUrl?.startsWith("/uploads/avatars/")) return;
  try {
    await unlink(path.join(process.cwd(), "public", publicUrl));
  } catch {
    // ignore
  }
}

export async function uploadAdminAvatarAction(
  formData: FormData
): Promise<AdminProfileResult<AdminProfile>> {
  try {
    const admin = await requireAdmin();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { error: "Please choose an image file." };
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return { error: "Only JPG, PNG, or WEBP images are allowed." };
    }
    if (file.size > MAX_AVATAR_SIZE) {
      return { error: "Avatar must be 2MB or smaller." };
    }

    const existing = await prisma.user.findUnique({
      where: { id: admin.id },
      select: { avatarUrl: true },
    });

    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars", admin.id);
    await mkdir(uploadDir, { recursive: true });

    const filename = `${randomUUID()}.${extensionForMime(file.type)}`;
    await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
    const publicUrl = `/uploads/avatars/${admin.id}/${filename}`;

    await removeLocalAvatar(existing?.avatarUrl);

    await prisma.user.upsert({
      where: { id: admin.id },
      create: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        phone: admin.phone,
        role: "ADMIN",
        avatarUrl: publicUrl,
      },
      update: { avatarUrl: publicUrl },
    });

    const supabase = await createClient();
    await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    const profile = await loadAdminProfile(admin.id);
    revalidatePath("/admin/profile");
    revalidatePath("/admin", "layout");
    return { data: profile ?? undefined, success: "Avatar updated." };
  } catch (error) {
    return handleError(error);
  }
}

export async function removeAdminAvatarAction(): Promise<AdminProfileResult<AdminProfile>> {
  try {
    const admin = await requireAdmin();
    const existing = await prisma.user.findUnique({
      where: { id: admin.id },
      select: { avatarUrl: true },
    });
    await removeLocalAvatar(existing?.avatarUrl);

    await prisma.user.update({
      where: { id: admin.id },
      data: { avatarUrl: null },
    });

    const supabase = await createClient();
    await supabase.auth.updateUser({
      data: { avatar_url: null },
    });

    const profile = await loadAdminProfile(admin.id);
    revalidatePath("/admin/profile");
    revalidatePath("/admin", "layout");
    return { data: profile ?? undefined, success: "Avatar removed." };
  } catch (error) {
    return handleError(error);
  }
}
