export type ProductCategory = "Eye Care" | "Brain Health" | "Omega" | "Vitamins";
export type ProductStatus = "Active" | "Draft" | "Archived";
export type OfferBadge = "Sale" | "Flash" | "Bundle" | "Clearance";

export type AdminProduct = {
  id: string;
  name: string;
  nameBn?: string;
  slug: string;
  category: ProductCategory;
  brand: string;
  sku: string;
  barcode?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  offerEnabled: boolean;
  offerLabel?: string;
  discountPercent?: number;
  offerPrice?: number;
  offerStartsAt?: string;
  offerEndsAt?: string;
  offerBadge?: OfferBadge;
  stock: number;
  lowStockThreshold: number;
  unit: string;
  dosageForm?: string;
  strength?: string;
  strengthUnit?: string;
  packSize?: string;
  quantityPerPack?: number;
  routeOfAdmin?: string;
  servingSize?: string;
  genericName?: string;
  prescriptionRequired?: boolean;
  shortDescription: string;
  description: string;
  descriptionBn?: string;
  ingredients?: string;
  usageInstructions?: string;
  warnings?: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  featured: boolean;
  labTested: boolean;
  doctorRecommended: boolean;
  status: ProductStatus;
  imageTone: string;
  imageCount: number;
  imageUrls?: string[];
  images?: Array<{ id: string; url: string; isPrimary: boolean }>;
  createdAt: string;
  updatedAt: string;
};

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Eye Care",
  "Brain Health",
  "Omega",
  "Vitamins",
];

export const PRODUCT_UNITS = ["Bottle", "Box", "Softgel Pack", "Sachet Pack", "Jar"];

/** Pharmaceutical dosage forms shown on admin product forms & PDP. */
export const DOSAGE_FORMS = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Injection",
  "Cream",
  "Ointment",
  "Drops",
  "Eye Drop",
  "Inhaler",
] as const;

export type DosageForm = (typeof DOSAGE_FORMS)[number];

/**
 * Strength measurement vocabulary (for examples / helpers).
 * Strength itself is stored as one text field, e.g. "500 mg", "250 mg/5 ml", "1%".
 */
export const STRENGTH_UNITS = [
  "mg",
  "mcg",
  "g",
  "kg",
  "ml",
  "L",
  "IU",
  "mEq",
  "%",
  "mg/ml",
  "mg/5 ml",
  "mg/g",
  "mcg/ml",
  "IU/ml",
] as const;

export type StrengthUnit = (typeof STRENGTH_UNITS)[number];

/** Example strength values for admin datalist (Arogga / Lazz-style). */
export const STRENGTH_EXAMPLES = [
  "500 mg",
  "250 mg",
  "250 mg/5 ml",
  "10 mg/ml",
  "1000 IU",
  "1000 IU/ml",
  "5 mcg",
  "1%",
  "50 mg/g",
  "25 mcg/ml",
] as const;

/**
 * Pack quantity types — NOT strength units.
 * Used with quantity to build pack size, e.g. "10 Tablets", "100 ml".
 */
export const PACK_TYPES = [
  "Tablet",
  "Capsule",
  "Bottle",
  "Tube",
  "Vial",
  "Ampoule",
  "Strip",
  "Sachet",
  "Pack",
  "Box",
  "Piece",
  "ml",
  "g",
] as const;

export type PackType = (typeof PACK_TYPES)[number];

/** How the medicine is administered (value stored in DB; label shown in admin UI). */
export const ROUTES_OF_ADMINISTRATION = [
  { value: "Oral", label: "Oral (মুখে সেবন)" },
  { value: "Topical", label: "Topical (ত্বকে প্রয়োগ)" },
  { value: "Intravenous (IV)", label: "Intravenous (IV) (শিরায়)" },
  { value: "Intramuscular (IM)", label: "Intramuscular (IM) (মাংসপেশিতে)" },
  { value: "Subcutaneous (SC)", label: "Subcutaneous (SC) (ত্বকের নিচে)" },
  { value: "Inhalation", label: "Inhalation (শ্বাসের মাধ্যমে)" },
  { value: "Ophthalmic (Eye)", label: "Ophthalmic (Eye) (চোখে)" },
  { value: "Otic (Ear)", label: "Otic (Ear) (কানে)" },
  { value: "Nasal", label: "Nasal (নাকে)" },
  { value: "Rectal", label: "Rectal (মলদ্বারে)" },
  { value: "Vaginal", label: "Vaginal (যোনিতে)" },
  { value: "Sublingual", label: "Sublingual (জিভের নিচে)" },
  { value: "Buccal", label: "Buccal (গালের ভিতরে)" },
] as const;

export type RouteOfAdministration = (typeof ROUTES_OF_ADMINISTRATION)[number]["value"];

/** Map legacy short values to the new catalog labels. */
export function normalizeRouteOfAdmin(value?: string | null) {
  if (!value) return undefined;
  const trimmed = value.trim();
  const direct = ROUTES_OF_ADMINISTRATION.find((item) => item.value === trimmed);
  if (direct) return direct.value;

  const legacy: Record<string, RouteOfAdministration> = {
    IV: "Intravenous (IV)",
    IM: "Intramuscular (IM)",
    SC: "Subcutaneous (SC)",
    Eye: "Ophthalmic (Eye)",
    Ear: "Otic (Ear)",
  };
  return legacy[trimmed] ?? trimmed;
}

export function routeOfAdminLabel(value?: string | null) {
  const normalized = normalizeRouteOfAdmin(value);
  if (!normalized) return undefined;
  const match = ROUTES_OF_ADMINISTRATION.find((item) => item.value === normalized);
  return match?.label ?? normalized;
}

/** Common pack-size presets (free text still allowed). */
export const PACK_SIZE_PRESETS = [
  "10 Tablets",
  "30 Capsules",
  "60 Capsules",
  "100 ml",
  "1 Tube",
  "1 Vial",
  "1 Ampoule",
  "10 Sachets",
  "1 Pack",
  "1 Box",
  "30 Softgels",
] as const;

/** Build pack size text from quantity + pack type. */
export function buildPackSizeLabel(quantity: number, packType: string) {
  if (!quantity || quantity < 1 || !packType.trim()) return "";
  const type = packType.trim();
  if (type === "ml" || type === "g") return `${quantity} ${type}`;

  const plurals: Record<string, string> = {
    Tablet: "Tablets",
    Capsule: "Capsules",
    Bottle: "Bottles",
    Tube: "Tubes",
    Vial: "Vials",
    Ampoule: "Ampoules",
    Strip: "Strips",
    Sachet: "Sachets",
    Pack: "Packs",
    Box: "Boxes",
    Piece: "Pieces",
  };

  if (quantity === 1) return `1 ${type}`;
  return `${quantity} ${plurals[type] ?? type}`;
}

/**
 * Display strength for storefront / admin.
 * Prefers the single strength text; falls back to legacy strength + unit.
 */
export function formatProductStrength(
  strength?: string | null,
  strengthUnit?: string | null
) {
  const value = strength?.trim();
  if (!value) return undefined;
  const unit = strengthUnit?.trim();
  if (!unit) return value;
  // Already a full strength string (Arogga-style)
  if (/[a-zA-Z%]/.test(value)) return value;
  return `${value} ${unit}`;
}

const imageTones = [
  "bg-[linear-gradient(135deg,#edf6ff_0%,#d8e9fb_100%)]",
  "bg-[linear-gradient(135deg,#edf8f5_0%,#d8ede7_100%)]",
  "bg-[linear-gradient(135deg,#f1f5ff_0%,#dee7fb_100%)]",
  "bg-[linear-gradient(135deg,#fdf4e8_0%,#f8e2c2_100%)]",
  "bg-[linear-gradient(135deg,#eaf8ff_0%,#d5ebf8_100%)]",
  "bg-[linear-gradient(135deg,#ecf6f2_0%,#d9ece5_100%)]",
  "bg-[linear-gradient(135deg,#f2f9ed_0%,#deefd2_100%)]",
  "bg-[linear-gradient(135deg,#fff5e6_0%,#fbe4c1_100%)]",
];

export const initialAdminProducts: AdminProduct[] = [
  {
    id: "prod-1",
    name: "Vision Guard Plus",
    nameBn: "ভিশন গার্ড প্লাস",
    slug: "vision-guard-plus",
    category: "Eye Care",
    brand: "Well Health",
    sku: "WHT-EYE-1001",
    barcode: "8901001001001",
    price: 1450,
    compareAtPrice: 1650,
    costPrice: 820,
    stock: 64,
    lowStockThreshold: 15,
    unit: "Bottle",
    packSize: "60 capsules",
    servingSize: "1 capsule daily",
    shortDescription: "Lutein-rich daily eye support for screen-heavy lifestyles.",
    description: "Lutein-rich blend crafted for daily eye strain support and long-term retinal wellness.",
    descriptionBn: "প্রতিদিনের চোখের সুরক্ষায় লুটেইন সমৃদ্ধ ফর্মুলা।",
    ingredients: "Lutein, Zeaxanthin, Vitamin A, Zinc",
    usageInstructions: "Take 1 capsule daily after a meal with water.",
    warnings: "Consult a physician if pregnant or under medical care.",
    tags: ["Eye Care", "Lutein", "Daily"],
    metaTitle: "Vision Guard Plus | Well Health",
    metaDescription: "Premium lutein formula for everyday eye comfort and clarity.",
    featured: true,
    labTested: true,
    doctorRecommended: true,
    offerEnabled: true,
    offerLabel: "Eye Care Week",
    discountPercent: 12,
    offerPrice: 1450,
    offerStartsAt: "2026-07-01T00:00:00.000Z",
    offerEndsAt: "2026-07-31T23:59:59.000Z",
    offerBadge: "Sale",
    status: "Active",
    imageTone: imageTones[0],
    imageCount: 3,
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-07-01T10:00:00.000Z",
  },
  {
    id: "prod-2",
    name: "Retina Shield Omega",
    slug: "retina-shield-omega",
    category: "Eye Care",
    brand: "Well Health",
    sku: "WHT-EYE-1002",
    price: 1320,
    stock: 14,
    lowStockThreshold: 10,
    unit: "Softgel Pack",
    packSize: "30 softgels",
    shortDescription: "Omega support for retinal performance.",
    description: "Omega support formula to help maintain retinal performance.",
    tags: ["Omega", "Eye Care"],
    featured: false,
    labTested: true,
    doctorRecommended: false,
    offerEnabled: false,
    status: "Active",
    imageTone: imageTones[1],
    imageCount: 2,
    createdAt: "2026-06-02T10:00:00.000Z",
    updatedAt: "2026-07-02T10:00:00.000Z",
  },
  {
    id: "prod-3",
    name: "Neuro Balance Plus",
    slug: "neuro-balance-plus",
    category: "Brain Health",
    brand: "Well Health",
    sku: "WHT-BRN-2001",
    price: 1780,
    compareAtPrice: 1990,
    stock: 39,
    lowStockThreshold: 12,
    unit: "Bottle",
    packSize: "60 capsules",
    shortDescription: "Focus and clarity support for busy days.",
    description: "B-complex and herbal matrix designed for focus and clarity.",
    tags: ["Focus", "Brain"],
    featured: true,
    labTested: true,
    doctorRecommended: true,
    offerEnabled: true,
    offerLabel: "Focus Bundle",
    discountPercent: 10,
    offerStartsAt: "2026-07-05T00:00:00.000Z",
    offerEndsAt: "2026-08-05T23:59:59.000Z",
    offerBadge: "Bundle",
    status: "Active",
    imageTone: imageTones[2],
    imageCount: 4,
    createdAt: "2026-06-03T10:00:00.000Z",
    updatedAt: "2026-07-03T10:00:00.000Z",
  },
  {
    id: "prod-4",
    name: "Mind Spark Junior",
    slug: "mind-spark-junior",
    category: "Brain Health",
    brand: "Well Health",
    sku: "WHT-BRN-2002",
    price: 1210,
    stock: 0,
    lowStockThreshold: 8,
    unit: "Bottle",
    shortDescription: "Gentle cognition support for younger routines.",
    description: "Gentle cognition support for younger wellness routines.",
    tags: ["Junior", "Brain"],
    featured: false,
    labTested: false,
    doctorRecommended: false,
    offerEnabled: false,
    status: "Draft",
    imageTone: imageTones[3],
    imageCount: 1,
    createdAt: "2026-06-04T10:00:00.000Z",
    updatedAt: "2026-07-04T10:00:00.000Z",
  },
  {
    id: "prod-5",
    name: "Omega 3 Triple Strength",
    slug: "omega-3-triple-strength",
    category: "Omega",
    brand: "Well Health",
    sku: "WHT-OMG-3001",
    price: 1680,
    stock: 22,
    lowStockThreshold: 10,
    unit: "Softgel Pack",
    packSize: "60 softgels",
    shortDescription: "High-potency EPA and DHA formula.",
    description: "Concentrated fish oil with EPA and DHA for heart-health support.",
    tags: ["Omega-3", "Heart"],
    featured: true,
    labTested: true,
    doctorRecommended: true,
    offerEnabled: true,
    offerLabel: "Flash Deal",
    discountPercent: 15,
    offerPrice: 1428,
    offerStartsAt: "2026-07-10T00:00:00.000Z",
    offerEndsAt: "2026-07-15T23:59:59.000Z",
    offerBadge: "Flash",
    status: "Active",
    imageTone: imageTones[4],
    imageCount: 3,
    createdAt: "2026-06-05T10:00:00.000Z",
    updatedAt: "2026-07-05T10:00:00.000Z",
  },
  {
    id: "prod-6",
    name: "Cardio Omega Softgel",
    slug: "cardio-omega-softgel",
    category: "Omega",
    brand: "Well Health",
    sku: "WHT-OMG-3002",
    price: 1490,
    compareAtPrice: 1690,
    stock: 9,
    lowStockThreshold: 10,
    unit: "Softgel Pack",
    shortDescription: "Daily omega for lipid balance.",
    description: "Daily omega support formulated for lipid balance.",
    tags: ["Cardio", "Omega"],
    featured: false,
    labTested: true,
    doctorRecommended: false,
    offerEnabled: false,
    status: "Active",
    imageTone: imageTones[5],
    imageCount: 2,
    createdAt: "2026-06-06T10:00:00.000Z",
    updatedAt: "2026-07-06T10:00:00.000Z",
  },
  {
    id: "prod-7",
    name: "Daily Multivitamin Core",
    slug: "daily-multivitamin-core",
    category: "Vitamins",
    brand: "Well Health",
    sku: "WHT-VIT-4001",
    price: 980,
    stock: 120,
    lowStockThreshold: 20,
    unit: "Bottle",
    packSize: "90 tablets",
    shortDescription: "Complete daily vitamin baseline.",
    description: "Comprehensive daily vitamin and mineral baseline blend.",
    tags: ["Multivitamin", "Daily"],
    featured: false,
    labTested: true,
    doctorRecommended: false,
    offerEnabled: false,
    status: "Active",
    imageTone: imageTones[6],
    imageCount: 2,
    createdAt: "2026-06-07T10:00:00.000Z",
    updatedAt: "2026-07-07T10:00:00.000Z",
  },
  {
    id: "prod-8",
    name: "Vitamin D3+K2 Gold",
    slug: "vitamin-d3-k2-gold",
    category: "Vitamins",
    brand: "Well Health",
    sku: "WHT-VIT-4002",
    price: 1120,
    stock: 0,
    lowStockThreshold: 10,
    unit: "Bottle",
    packSize: "60 softgels",
    shortDescription: "Bone and immune support pairing.",
    description: "Bone and immune support with active D3 and K2 pairing.",
    tags: ["Vitamin D", "K2"],
    featured: true,
    labTested: true,
    doctorRecommended: true,
    offerEnabled: false,
    status: "Active",
    imageTone: imageTones[7],
    imageCount: 3,
    createdAt: "2026-06-08T10:00:00.000Z",
    updatedAt: "2026-07-08T10:00:00.000Z",
  },
];

export function slugifyProductName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function formatProductPrice(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
  })
    .format(value)
    .replace("BDT", "৳");
}

export function getProductStockBucket(
  stock: number,
  lowStockThreshold = 20
): "In Stock" | "Low Stock" | "Out of Stock" {
  if (stock <= 0) return "Out of Stock";
  if (stock <= lowStockThreshold) return "Low Stock";
  return "In Stock";
}

export function getDefaultImageTone(index = 0) {
  return imageTones[index % imageTones.length];
}

export function getProductDiscountPercent(product: Pick<AdminProduct, "price" | "compareAtPrice" | "discountPercent" | "offerPrice">) {
  if (product.discountPercent && product.discountPercent > 0) return Math.round(product.discountPercent);
  if (product.offerPrice && product.offerPrice < product.price) {
    return Math.round(((product.price - product.offerPrice) / product.price) * 100);
  }
  if (product.compareAtPrice && product.compareAtPrice > product.price) {
    return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
  }
  return 0;
}

export function isProductOfferActive(product: Pick<AdminProduct, "offerEnabled" | "offerStartsAt" | "offerEndsAt">) {
  if (!product.offerEnabled) return false;
  const now = Date.now();
  if (product.offerStartsAt && new Date(product.offerStartsAt).getTime() > now) return false;
  if (product.offerEndsAt && new Date(product.offerEndsAt).getTime() < now) return false;
  return true;
}
