"use server";

import { revalidatePath } from "next/cache";

import { AdminAuthError, requireAdminPermission } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import {
  STORE_SETTINGS_KEY,
  defaultStoreSettings,
  normalizeStoreSettingsInput,
  storeSettingsSchema,
  type StoreSettings,
} from "@/lib/settings/schemas";

export type SettingsActionResult<T = undefined> = {
  error?: string;
  data?: T;
  success?: string;
};

function handleError<T = undefined>(error: unknown): SettingsActionResult<T> {
  if (
    error instanceof AdminAuthError ||
    (error instanceof Error && error.name === "AdminAuthError")
  ) {
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }
  console.error("Settings action failed:", error);
  return {
    error: error instanceof Error ? error.message : "Something went wrong. Please try again.",
  };
}

function parseSettings(value: unknown): StoreSettings {
  const parsed = storeSettingsSchema.safeParse(value);
  if (!parsed.success) return defaultStoreSettings;
  return { ...defaultStoreSettings, ...parsed.data };
}

async function loadSettings(): Promise<StoreSettings> {
  const row = await prisma.siteSetting.findUnique({ where: { key: STORE_SETTINGS_KEY } });
  if (!row) return defaultStoreSettings;
  return parseSettings(row.value);
}

function revalidateStorefront() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  revalidatePath("/contact");
}

export async function getStoreSettingsAction(): Promise<SettingsActionResult<StoreSettings>> {
  try {
    await requireAdminPermission("settings");
    return { data: await loadSettings() };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateStoreSettingsAction(
  input: StoreSettings
): Promise<SettingsActionResult<StoreSettings>> {
  try {
    await requireAdminPermission("settings");
    const normalized = normalizeStoreSettingsInput(input);
    const parsed = storeSettingsSchema.safeParse(normalized);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid settings" };
    }

    await prisma.siteSetting.upsert({
      where: { key: STORE_SETTINGS_KEY },
      create: { key: STORE_SETTINGS_KEY, value: parsed.data },
      update: { value: parsed.data },
    });

    revalidateStorefront();
    return { data: parsed.data, success: "Settings saved successfully." };
  } catch (error) {
    return handleError(error);
  }
}
