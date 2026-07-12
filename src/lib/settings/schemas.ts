import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value === "" || /^https?:\/\//i.test(value), {
    message: "Use a full URL starting with https://",
  });

export const storeSettingsSchema = z.object({
  storeName: z.string().trim().min(2, "Store name is required"),
  tagline: z.string().trim().max(120).default(""),
  supportEmail: z.string().trim().email("Enter a valid support email"),
  supportPhone: z.string().trim().min(8, "Support phone is required"),
  whatsapp: z.string().trim().optional().or(z.literal("")),
  addressLine1: z.string().trim().min(3, "Address is required"),
  addressLine2: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().min(2, "City is required"),
  country: z.string().trim().min(2).default("Bangladesh"),
  workingHours: z.string().trim().min(3, "Working hours are required"),
  facebookUrl: optionalUrl.default(""),
  instagramUrl: optionalUrl.default(""),
  linkedinUrl: optionalUrl.default(""),
  youtubeUrl: optionalUrl.default(""),
  currencyCode: z.string().trim().default("BDT"),
  currencySymbol: z.string().trim().default("৳"),
  freeShippingMin: z.number().min(0).default(2000),
  codEnabled: z.boolean().default(true),
  maintenanceMode: z.boolean().default(false),
  seoTitle: z.string().trim().max(70).default(""),
  seoDescription: z.string().trim().max(180).default(""),
});

export type StoreSettings = z.infer<typeof storeSettingsSchema>;

export const STORE_SETTINGS_KEY = "store_settings";

export const defaultStoreSettings: StoreSettings = {
  storeName: "Well Health Trade International",
  tagline: "Better Health, Better Life",
  supportEmail: "info@wellhealthint.com",
  supportPhone: "+880 1712 345 678",
  whatsapp: "+8801712345678",
  addressLine1: "House 24, Road 12, Dhanmondi",
  addressLine2: "",
  city: "Dhaka",
  country: "Bangladesh",
  workingHours: "Sat - Thu: 9.00 AM - 6.00 PM",
  facebookUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
  youtubeUrl: "",
  currencyCode: "BDT",
  currencySymbol: "৳",
  freeShippingMin: 2000,
  codEnabled: true,
  maintenanceMode: false,
  seoTitle: "Well Health Trade International",
  seoDescription:
    "Premium health supplements with clinical quality and nature-backed formulations for everyday wellbeing.",
};

/** Soften empty optional URL fields before zod URL validation. */
export function normalizeStoreSettingsInput(input: StoreSettings): StoreSettings {
  const emptyToBlank = (value?: string) => {
    const trimmed = value?.trim() ?? "";
    if (!trimmed || trimmed === "#") return "";
    return trimmed;
  };

  return {
    ...input,
    facebookUrl: emptyToBlank(input.facebookUrl),
    instagramUrl: emptyToBlank(input.instagramUrl),
    linkedinUrl: emptyToBlank(input.linkedinUrl),
    youtubeUrl: emptyToBlank(input.youtubeUrl),
    whatsapp: input.whatsapp?.trim() ?? "",
    addressLine2: input.addressLine2?.trim() ?? "",
  };
}

export function formatStoreAddress(settings: StoreSettings) {
  return [settings.addressLine1, settings.addressLine2, settings.city, settings.country]
    .map((part) => (part ?? "").trim())
    .filter(Boolean)
    .join(", ");
}

/** Directions link for Google Maps. */
export function googleMapsDirectionsUrl(settings: StoreSettings) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatStoreAddress(settings))}`;
}

/** Embeddable Google Maps iframe src (no API key required). */
export function googleMapsEmbedUrl(settings: StoreSettings) {
  const query = encodeURIComponent(formatStoreAddress(settings));
  return `https://maps.google.com/maps?q=${query}&z=16&output=embed`;
}

export function phoneTelHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
