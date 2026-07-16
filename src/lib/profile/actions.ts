"use server";

import { Gender, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { getSessionUser } from "@/lib/auth/session";
import { deleteCloudinaryImage, uploadImageToCloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { rateLimitForRequest } from "@/lib/rate-limit/server";
import {
  customerAddressSchema,
  customerPasswordChangeSchema,
  customerPreferencesSchema,
  customerProfileUpdateSchema,
  deleteAccountSchema,
  type CustomerAddressInput,
  type CustomerPasswordChangeInput,
  type CustomerPreferencesInput,
  type CustomerProfileUpdateInput,
  type DeleteAccountInput,
} from "@/lib/profile/schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type CustomerPreferences = CustomerPreferencesInput;

export type CustomerAddressDto = {
  id: string;
  fullName: string;
  phone: string;
  district: string;
  area: string;
  details: string;
  isDefault: boolean;
};

export type CustomerProfile = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  gender: Gender;
  avatarUrl: string | null;
  preferences: CustomerPreferences;
  createdAt: string;
  addresses: CustomerAddressDto[];
};

export type ProfileResult<T = undefined> = {
  error?: string;
  data?: T;
  success?: string;
};

const DEFAULT_PREFERENCES: CustomerPreferences = {
  language: "en",
  orderUpdates: true,
  promotions: false,
  newsletter: true,
  sms: true,
};

class ProfileAuthError extends Error {
  constructor(message = "Please sign in to continue.") {
    super(message);
    this.name = "ProfileAuthError";
  }
}

function normalizePhone(phone?: string | null) {
  const trimmed = phone?.trim() ?? "";
  if (!trimmed) return null;
  const digits = trimmed.replace(/[\s-]/g, "");
  if (digits.startsWith("+880")) return digits;
  if (digits.startsWith("880")) return `+${digits}`;
  if (digits.startsWith("0")) return `+880${digits.slice(1)}`;
  if (digits.startsWith("1") && digits.length === 10) return `+880${digits}`;
  return digits.startsWith("+") ? digits : `+880${digits}`;
}

/** Strip +880 / 880 / 0 for form display (local BD mobile digits). */
function toLocalPhoneDigits(phone?: string | null) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("880") && digits.length >= 13) return digits.slice(3);
  if (digits.startsWith("0") && digits.length >= 11) return digits.slice(1);
  return digits;
}

function parsePreferences(value: Prisma.JsonValue | null | undefined): CustomerPreferences {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...DEFAULT_PREFERENCES };
  }
  const raw = value as Record<string, unknown>;
  const parsed = customerPreferencesSchema.safeParse({
    language: raw.language === "bn" ? "bn" : "en",
    orderUpdates: typeof raw.orderUpdates === "boolean" ? raw.orderUpdates : DEFAULT_PREFERENCES.orderUpdates,
    promotions: typeof raw.promotions === "boolean" ? raw.promotions : DEFAULT_PREFERENCES.promotions,
    newsletter: typeof raw.newsletter === "boolean" ? raw.newsletter : DEFAULT_PREFERENCES.newsletter,
    sms: typeof raw.sms === "boolean" ? raw.sms : DEFAULT_PREFERENCES.sms,
  });
  return parsed.success ? parsed.data : { ...DEFAULT_PREFERENCES };
}

function mapAddress(address: {
  id: string;
  fullName: string;
  phone: string;
  district: string;
  area: string;
  details: string;
  isDefault: boolean;
}): CustomerAddressDto {
  return {
    id: address.id,
    fullName: address.fullName,
    phone: toLocalPhoneDigits(address.phone),
    district: address.district,
    area: address.area,
    details: address.details,
    isDefault: address.isDefault,
  };
}

async function requireProfileUser() {
  const session = await getSessionUser();
  if (!session) throw new ProfileAuthError();
  return session;
}

function handleError<T = undefined>(error: unknown): ProfileResult<T> {
  if (error instanceof ProfileAuthError || (error instanceof Error && error.name === "ProfileAuthError")) {
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }
  console.error("Customer profile action failed:", error);
  return {
    error: error instanceof Error ? error.message : "Something went wrong. Please try again.",
  };
}

async function ensureUserRow(session: Awaited<ReturnType<typeof requireProfileUser>>) {
  return prisma.user.upsert({
    where: { id: session.id },
    create: {
      id: session.id,
      email: session.email,
      name: session.name,
      phone: session.phone,
      role: session.role,
      preferences: DEFAULT_PREFERENCES as Prisma.InputJsonValue,
    },
    update: {},
    include: {
      addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] },
    },
  });
}

async function loadProfile(userId: string): Promise<CustomerProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] },
    },
  });
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth
      ? user.dateOfBirth.toISOString().slice(0, 10)
      : null,
    gender: user.gender,
    avatarUrl: user.avatarUrl,
    preferences: parsePreferences(user.preferences),
    createdAt: user.createdAt.toISOString(),
    addresses: user.addresses.map(mapAddress),
  };
}

function revalidateProfilePaths() {
  revalidatePath("/profile", "layout");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/profile");
  revalidatePath("/dashboard");
}

export async function getCustomerProfileAction(): Promise<ProfileResult<CustomerProfile>> {
  try {
    const session = await requireProfileUser();
    await ensureUserRow(session);
    const profile = await loadProfile(session.id);
    if (!profile) return { error: "Profile not found." };
    return { data: profile };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateCustomerProfileAction(
  input: CustomerProfileUpdateInput
): Promise<ProfileResult<CustomerProfile>> {
  try {
    const session = await requireProfileUser();
    const parsed = customerProfileUpdateSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid profile details" };
    }

    const name = parsed.data.name.trim();
    const phone = normalizePhone(parsed.data.phone);
    const dateOfBirth = parsed.data.dateOfBirth
      ? new Date(`${parsed.data.dateOfBirth}T00:00:00.000Z`)
      : null;
    const gender = parsed.data.gender as Gender;

    const supabase = await createClient();
    const { error: metaError } = await supabase.auth.updateUser({
      data: {
        full_name: name,
        phone: phone ?? "",
      },
    });
    if (metaError) return { error: metaError.message };

    await prisma.user.upsert({
      where: { id: session.id },
      create: {
        id: session.id,
        email: session.email,
        name,
        phone,
        dateOfBirth,
        gender,
        role: session.role,
        preferences: DEFAULT_PREFERENCES as Prisma.InputJsonValue,
      },
      update: {
        name,
        phone,
        dateOfBirth,
        gender,
      },
    });

    const profile = await loadProfile(session.id);
    revalidateProfilePaths();
    return { data: profile ?? undefined, success: "Profile updated successfully." };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateCustomerPreferencesAction(
  input: CustomerPreferencesInput
): Promise<ProfileResult<CustomerProfile>> {
  try {
    const session = await requireProfileUser();
    const parsed = customerPreferencesSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid preferences" };
    }

    await ensureUserRow(session);
    await prisma.user.update({
      where: { id: session.id },
      data: { preferences: parsed.data as Prisma.InputJsonValue },
    });

    const profile = await loadProfile(session.id);
    revalidateProfilePaths();
    return { data: profile ?? undefined, success: "Preferences saved." };
  } catch (error) {
    return handleError(error);
  }
}

export async function changeCustomerPasswordAction(
  input: CustomerPasswordChangeInput
): Promise<ProfileResult> {
  try {
    const session = await requireProfileUser();
    const parsed = customerPasswordChangeSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid password details" };
    }

    const rateLimited = await rateLimitForRequest("auth:change-password", session.id);
    if (rateLimited) return rateLimited;

    const supabase = await createClient();
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: session.email,
      password: parsed.data.currentPassword,
    });
    if (verifyError) {
      return { error: "Current password is incorrect." };
    }

    const { error } = await supabase.auth.updateUser({
      password: parsed.data.newPassword,
    });
    if (error) return { error: error.message };

    return { success: "Password updated successfully." };
  } catch (error) {
    return handleError(error);
  }
}

async function clearOtherDefaults(userId: string, exceptId?: string) {
  await prisma.address.updateMany({
    where: {
      userId,
      isDefault: true,
      ...(exceptId ? { id: { not: exceptId } } : {}),
    },
    data: { isDefault: false },
  });
}

async function ensureOneDefault(userId: string) {
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  if (addresses.length === 0) return;
  if (addresses.some((a) => a.isDefault)) return;
  await prisma.address.update({
    where: { id: addresses[0]!.id },
    data: { isDefault: true },
  });
}

export async function createCustomerAddressAction(
  input: CustomerAddressInput
): Promise<ProfileResult<CustomerProfile>> {
  try {
    const session = await requireProfileUser();
    const parsed = customerAddressSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid address" };
    }

    await ensureUserRow(session);
    const count = await prisma.address.count({ where: { userId: session.id } });
    const makeDefault = parsed.data.isDefault || count === 0;
    const phone = normalizePhone(parsed.data.phone) ?? parsed.data.phone.trim();

    if (makeDefault) await clearOtherDefaults(session.id);

    await prisma.address.create({
      data: {
        userId: session.id,
        fullName: parsed.data.fullName.trim(),
        phone,
        district: parsed.data.district.trim(),
        area: parsed.data.area.trim(),
        details: parsed.data.details.trim(),
        isDefault: makeDefault,
      },
    });

    const profile = await loadProfile(session.id);
    revalidateProfilePaths();
    return { data: profile ?? undefined, success: "Address added." };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateCustomerAddressAction(
  id: string,
  input: CustomerAddressInput
): Promise<ProfileResult<CustomerProfile>> {
  try {
    const session = await requireProfileUser();
    const parsed = customerAddressSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid address" };
    }

    const existing = await prisma.address.findFirst({
      where: { id, userId: session.id },
    });
    if (!existing) return { error: "Address not found." };

    const phone = normalizePhone(parsed.data.phone) ?? parsed.data.phone.trim();
    const makeDefault = Boolean(parsed.data.isDefault);

    if (makeDefault) await clearOtherDefaults(session.id, id);

    await prisma.address.update({
      where: { id },
      data: {
        fullName: parsed.data.fullName.trim(),
        phone,
        district: parsed.data.district.trim(),
        area: parsed.data.area.trim(),
        details: parsed.data.details.trim(),
        isDefault: makeDefault || existing.isDefault,
      },
    });

    if (!makeDefault && existing.isDefault) {
      await ensureOneDefault(session.id);
    }

    const profile = await loadProfile(session.id);
    revalidateProfilePaths();
    return { data: profile ?? undefined, success: "Address updated." };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteCustomerAddressAction(
  id: string
): Promise<ProfileResult<CustomerProfile>> {
  try {
    const session = await requireProfileUser();
    const existing = await prisma.address.findFirst({
      where: { id, userId: session.id },
    });
    if (!existing) return { error: "Address not found." };

    await prisma.address.delete({ where: { id } });
    await ensureOneDefault(session.id);

    const profile = await loadProfile(session.id);
    revalidateProfilePaths();
    return { data: profile ?? undefined, success: "Address removed." };
  } catch (error) {
    return handleError(error);
  }
}

export async function setDefaultCustomerAddressAction(
  id: string
): Promise<ProfileResult<CustomerProfile>> {
  try {
    const session = await requireProfileUser();
    const existing = await prisma.address.findFirst({
      where: { id, userId: session.id },
    });
    if (!existing) return { error: "Address not found." };

    await clearOtherDefaults(session.id);
    await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    const profile = await loadProfile(session.id);
    revalidateProfilePaths();
    return { data: profile ?? undefined, success: "Default address updated." };
  } catch (error) {
    return handleError(error);
  }
}

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export async function uploadCustomerAvatarAction(
  formData: FormData
): Promise<ProfileResult<CustomerProfile>> {
  try {
    const session = await requireProfileUser();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { error: "Please choose an image file." };
    }

    await ensureUserRow(session);
    const existing = await prisma.user.findUnique({
      where: { id: session.id },
      select: { avatarUrl: true },
    });

    const uploaded = await uploadImageToCloudinary(file, {
      folder: `avatars/${session.id}`,
      maxBytes: MAX_AVATAR_SIZE,
      allowedTypes: ALLOWED_TYPES,
    });

    await deleteCloudinaryImage(existing?.avatarUrl);

    await prisma.user.update({
      where: { id: session.id },
      data: { avatarUrl: uploaded.url },
    });

    const supabase = await createClient();
    await supabase.auth.updateUser({
      data: { avatar_url: uploaded.url },
    });

    const profile = await loadProfile(session.id);
    revalidateProfilePaths();
    return { data: profile ?? undefined, success: "Avatar updated." };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteCustomerAccountAction(
  input: DeleteAccountInput
): Promise<ProfileResult> {
  try {
    const session = await requireProfileUser();
    const parsed = deleteAccountSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Type "DELETE" to confirm' };
    }

    const existing = await prisma.user.findUnique({
      where: { id: session.id },
      select: { avatarUrl: true },
    });
    await deleteCloudinaryImage(existing?.avatarUrl);

    await prisma.user.delete({ where: { id: session.id } }).catch(() => null);

    try {
      const admin = createAdminClient();
      await admin.auth.admin.deleteUser(session.id);
    } catch (error) {
      console.error("Supabase deleteUser failed:", error);
      return { error: "Could not delete auth account. Please contact support." };
    }

    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidateProfilePaths();
    return { success: "Account deleted." };
  } catch (error) {
    return handleError(error);
  }
}
