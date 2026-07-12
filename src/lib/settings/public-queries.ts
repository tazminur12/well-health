import { prisma } from "@/lib/prisma";
import {
  STORE_SETTINGS_KEY,
  defaultStoreSettings,
  storeSettingsSchema,
  type StoreSettings,
} from "@/lib/settings/schemas";

export async function getPublicStoreSettings(): Promise<StoreSettings> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: STORE_SETTINGS_KEY } });
    if (!row) return defaultStoreSettings;
    const parsed = storeSettingsSchema.safeParse(row.value);
    return parsed.success ? { ...defaultStoreSettings, ...parsed.data } : defaultStoreSettings;
  } catch {
    return defaultStoreSettings;
  }
}
