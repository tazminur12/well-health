import { OfferBadge, PrismaClient, ProductStatus } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Eye Care", slug: "eye-care", sortOrder: 1 },
  { name: "Brain Health", slug: "brain-health", sortOrder: 2 },
  { name: "Omega", slug: "omega", sortOrder: 3 },
  { name: "Vitamins", slug: "vitamins", sortOrder: 4 },
];

const imageTones = [
  "bg-[linear-gradient(135deg,#edf6ff_0%,#d8e9fb_100%)]",
  "bg-[linear-gradient(135deg,#edf8f5_0%,#d8ede7_100%)]",
  "bg-[linear-gradient(135deg,#f1f5ff_0%,#dee7fb_100%)]",
  "bg-[linear-gradient(135deg,#fdf4e8_0%,#f8e2c2_100%)]",
  "bg-[linear-gradient(135deg,#eaf8ff_0%,#d5ebf8_100%)]",
  "bg-[linear-gradient(135deg,#ecf6f2_0%,#d9ece5_100%)]",
  "bg-[linear-gradient(135deg,#f2f9ed_0%,#deefd2_100%)]",
  "bg-[linear-gradient(135deg,#fff5e6_0%,#fbe4c1_100%)]",
  "bg-[linear-gradient(135deg,#eef7f3_0%,#dceee5_100%)]",
  "bg-[linear-gradient(135deg,#f7f1ff_0%,#e7def8_100%)]",
  "bg-[linear-gradient(135deg,#fff8ee_0%,#f8e8cf_100%)]",
  "bg-[linear-gradient(135deg,#f0f9f4_0%,#d9efe3_100%)]",
];

type SeedProduct = {
  name: string;
  nameBn?: string;
  slug: string;
  categoryName: string;
  brand?: string;
  sku: string;
  barcode?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold: number;
  unit: string;
  packSize?: string;
  servingSize?: string;
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
  offerEnabled: boolean;
  offerLabel?: string;
  discountPercent?: number;
  offerPrice?: number;
  offerStartsAt?: Date;
  offerEndsAt?: Date;
  offerBadge?: OfferBadge;
  status: ProductStatus;
  imageTone: string;
  imageCount: number;
};

const seedProducts: SeedProduct[] = [
  // ——— Public homepage / shop demo medicines ———
  {
    name: "Eyecare-B",
    nameBn: "আইকেয়ার-বি",
    slug: "eyecare-b",
    categoryName: "Eye Care",
    sku: "WHT-EYE-0001",
    barcode: "8901001000001",
    price: 850,
    compareAtPrice: 950,
    costPrice: 480,
    stock: 86,
    lowStockThreshold: 15,
    unit: "Bottle",
    packSize: "30 Tablets",
    servingSize: "1 tablet daily",
    shortDescription: "Eye Vitamin & Mineral, 30 Tablets",
    description:
      "Daily eye vitamin and mineral formula designed to support vision comfort and ocular wellness.",
    descriptionBn: "চোখের ভিটামিন ও মিনারেল — প্রতিদিনের চোখের যত্নে সহায়ক।",
    ingredients: "Vitamin A, Vitamin C, Zinc, Lutein",
    usageInstructions: "Take 1 tablet daily after a meal with water.",
    warnings: "Consult a physician if pregnant or under medical care.",
    tags: ["Eye Care", "Vitamins", "Daily"],
    metaTitle: "Eyecare-B | Well Health",
    metaDescription: "Eye vitamin & mineral formula — 30 tablets for daily vision support.",
    featured: true,
    labTested: true,
    doctorRecommended: true,
    offerEnabled: true,
    offerLabel: "Vision Care Offer",
    discountPercent: 10,
    offerPrice: 765,
    offerStartsAt: new Date("2026-07-01T00:00:00.000Z"),
    offerEndsAt: new Date("2026-08-31T23:59:59.000Z"),
    offerBadge: OfferBadge.SALE,
    status: ProductStatus.ACTIVE,
    imageTone: imageTones[0],
    imageCount: 3,
  },
  {
    name: "Brain Health Syrup",
    nameBn: "ব্রেইন হেলথ সিরাপ",
    slug: "brain-health-syrup",
    categoryName: "Brain Health",
    sku: "WHT-BRN-0001",
    barcode: "8901001000002",
    price: 950,
    compareAtPrice: 1100,
    costPrice: 520,
    stock: 54,
    lowStockThreshold: 12,
    unit: "Bottle",
    packSize: "200ml",
    servingSize: "10ml twice daily",
    shortDescription: "Omega 3,6,9 with Vitamins & Minerals, 200ml",
    description:
      "Brain support syrup with Omega 3,6,9 plus essential vitamins and minerals for focus and cognitive wellness.",
    descriptionBn: "ওমেগা ৩,৬,৯সহ ভিটামিন ও মিনারেল সমৃদ্ধ ব্রেইন সাপোর্ট সিরাপ।",
    ingredients: "Omega 3,6,9, B-complex, Zinc, Iron",
    usageInstructions: "Take 10ml twice daily after meals, or as directed by a physician.",
    warnings: "Shake well before use. Keep out of reach of children.",
    tags: ["Brain Health", "Syrup", "Omega"],
    metaTitle: "Brain Health Syrup | Well Health",
    metaDescription: "Omega 3,6,9 syrup with vitamins & minerals — 200ml.",
    featured: true,
    labTested: true,
    doctorRecommended: true,
    offerEnabled: false,
    status: ProductStatus.ACTIVE,
    imageTone: imageTones[2],
    imageCount: 2,
  },
  {
    name: "Omega 3 Softgels",
    nameBn: "ওমেগা ৩ সফটজেল",
    slug: "omega-3-softgels",
    categoryName: "Omega",
    sku: "WHT-OMG-0001",
    barcode: "8901001000003",
    price: 1200,
    compareAtPrice: 1400,
    costPrice: 680,
    stock: 72,
    lowStockThreshold: 10,
    unit: "Softgel Pack",
    packSize: "60 Softgels",
    servingSize: "1 softgel daily",
    shortDescription: "EPA 650mg | DHA 450mg, 60 Softgels",
    description:
      "High-strength Omega-3 softgels with EPA 650mg and DHA 450mg to support heart and brain health.",
    descriptionBn: "ইপিএ ও ডিএইচএ সমৃদ্ধ প্রিমিয়াম ওমেগা-৩ সফটজেল।",
    ingredients: "Fish Oil (EPA 650mg, DHA 450mg)",
    usageInstructions: "Take 1 softgel daily with a meal.",
    warnings: "Not suitable for those with fish allergy.",
    tags: ["Omega-3", "Heart", "EPA", "DHA"],
    metaTitle: "Omega 3 Softgels | Well Health",
    metaDescription: "EPA 650mg | DHA 450mg softgels for heart & brain support.",
    featured: true,
    labTested: true,
    doctorRecommended: true,
    offerEnabled: true,
    offerLabel: "Heart Health Deal",
    discountPercent: 14,
    offerPrice: 1032,
    offerStartsAt: new Date("2026-07-01T00:00:00.000Z"),
    offerEndsAt: new Date("2026-08-15T23:59:59.000Z"),
    offerBadge: OfferBadge.FLASH,
    status: ProductStatus.ACTIVE,
    imageTone: imageTones[4],
    imageCount: 3,
  },
  {
    name: "Multivitamin Daily",
    nameBn: "মাল্টিভিটামিন ডেইলি",
    slug: "multivitamin-daily",
    categoryName: "Vitamins",
    sku: "WHT-VIT-0001",
    barcode: "8901001000004",
    price: 890,
    compareAtPrice: 990,
    costPrice: 410,
    stock: 140,
    lowStockThreshold: 20,
    unit: "Bottle",
    packSize: "30 Tablets",
    servingSize: "1 tablet daily",
    shortDescription: "Complete Daily Nutrition, 30 Tablets",
    description:
      "Complete daily multivitamin and mineral blend for everyday energy, immunity, and wellness.",
    descriptionBn: "প্রতিদিনের পুষ্টির জন্য সম্পূর্ণ মাল্টিভিটামিন ট্যাবলেট।",
    ingredients: "Vitamins A–E, B-complex, Zinc, Selenium, Magnesium",
    usageInstructions: "Take 1 tablet daily after breakfast.",
    warnings: "Do not exceed the recommended daily dose.",
    tags: ["Multivitamin", "Daily", "Immunity"],
    metaTitle: "Multivitamin Daily | Well Health",
    metaDescription: "Complete daily nutrition multivitamin — 30 tablets.",
    featured: true,
    labTested: true,
    doctorRecommended: false,
    offerEnabled: false,
    status: ProductStatus.ACTIVE,
    imageTone: imageTones[6],
    imageCount: 2,
  },

  // ——— Extended catalog (admin demo) ———
  {
    name: "Vision Guard Plus",
    nameBn: "ভিশন গার্ড প্লাস",
    slug: "vision-guard-plus",
    categoryName: "Eye Care",
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
    description:
      "Lutein-rich blend crafted for daily eye strain support and long-term retinal wellness.",
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
    offerPrice: 1276,
    offerStartsAt: new Date("2026-07-01T00:00:00.000Z"),
    offerEndsAt: new Date("2026-07-31T23:59:59.000Z"),
    offerBadge: OfferBadge.SALE,
    status: ProductStatus.ACTIVE,
    imageTone: imageTones[0],
    imageCount: 3,
  },
  {
    name: "Retina Shield Omega",
    slug: "retina-shield-omega",
    categoryName: "Eye Care",
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
    status: ProductStatus.ACTIVE,
    imageTone: imageTones[1],
    imageCount: 2,
  },
  {
    name: "Neuro Balance Plus",
    slug: "neuro-balance-plus",
    categoryName: "Brain Health",
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
    offerStartsAt: new Date("2026-07-05T00:00:00.000Z"),
    offerEndsAt: new Date("2026-08-05T23:59:59.000Z"),
    offerBadge: OfferBadge.BUNDLE,
    status: ProductStatus.ACTIVE,
    imageTone: imageTones[2],
    imageCount: 4,
  },
  {
    name: "Mind Spark Junior",
    slug: "mind-spark-junior",
    categoryName: "Brain Health",
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
    status: ProductStatus.DRAFT,
    imageTone: imageTones[3],
    imageCount: 1,
  },
  {
    name: "Omega 3 Triple Strength",
    slug: "omega-3-triple-strength",
    categoryName: "Omega",
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
    offerStartsAt: new Date("2026-07-10T00:00:00.000Z"),
    offerEndsAt: new Date("2026-08-15T23:59:59.000Z"),
    offerBadge: OfferBadge.FLASH,
    status: ProductStatus.ACTIVE,
    imageTone: imageTones[4],
    imageCount: 3,
  },
  {
    name: "Cardio Omega Softgel",
    slug: "cardio-omega-softgel",
    categoryName: "Omega",
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
    status: ProductStatus.ACTIVE,
    imageTone: imageTones[5],
    imageCount: 2,
  },
  {
    name: "Daily Multivitamin Core",
    slug: "daily-multivitamin-core",
    categoryName: "Vitamins",
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
    status: ProductStatus.ACTIVE,
    imageTone: imageTones[6],
    imageCount: 2,
  },
  {
    name: "Vitamin D3+K2 Gold",
    slug: "vitamin-d3-k2-gold",
    categoryName: "Vitamins",
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
    status: ProductStatus.ACTIVE,
    imageTone: imageTones[7],
    imageCount: 3,
  },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: category,
      update: { name: category.name, sortOrder: category.sortOrder },
    });
  }

  const categoryMap = Object.fromEntries(
    (await prisma.category.findMany()).map((item) => [item.name, item.id])
  );

  for (const item of seedProducts) {
    const { categoryName, brand = "Well Health", ...rest } = item;
    const categoryId = categoryMap[categoryName];
    if (!categoryId) {
      throw new Error(`Missing category: ${categoryName}`);
    }

    const data = {
      ...rest,
      brand,
      categoryId,
    };

    await prisma.product.upsert({
      where: { sku: data.sku },
      create: data,
      update: data,
    });
  }

  const total = await prisma.product.count();
  console.log(`Upserted ${seedProducts.length} demo medicines. Total products in DB: ${total}`);

  // ——— Homepage CMS defaults ———
  const heroCount = await prisma.heroSlide.count();
  if (heroCount === 0) {
    await prisma.heroSlide.createMany({
      data: [
        {
          imageUrl:
            "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1920&h=700&q=80",
          alt: "Healthcare and wellness essentials banner",
          headline: "Better Health, Better Life",
          linkUrl: "/shop",
          sortOrder: 0,
          isActive: true,
        },
        {
          imageUrl:
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1920&h=700&q=80",
          alt: "Premium wellness product banner",
          headline: "Clinically Crafted Nutrition",
          linkUrl: "/shop",
          sortOrder: 1,
          isActive: true,
        },
        {
          imageUrl:
            "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1920&h=700&q=80",
          alt: "Clinical supplements banner",
          headline: "Nature-Backed Daily Care",
          linkUrl: "/shop",
          sortOrder: 2,
          isActive: true,
        },
        {
          imageUrl:
            "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=1920&h=700&q=80",
          alt: "Daily health essentials banner",
          headline: "Trusted Everyday Wellness",
          linkUrl: "/about",
          sortOrder: 3,
          isActive: true,
        },
      ],
    });
    console.log("Seeded hero slides");
  }

  const badgeCount = await prisma.trustBadge.count();
  if (badgeCount === 0) {
    await prisma.trustBadge.createMany({
      data: [
        {
          iconKey: "ShieldCheck",
          title: "Premium Quality",
          description: "Lab Tested Products",
          sortOrder: 0,
        },
        {
          iconKey: "BadgeCheck",
          title: "GMP Certified",
          description: "Manufacturing",
          sortOrder: 1,
        },
        {
          iconKey: "FlaskConical",
          title: "Scientifically Formulated",
          description: "For Better Results",
          sortOrder: 2,
        },
        {
          iconKey: "Stethoscope",
          title: "Trusted by Doctors",
          description: "Recommended",
          sortOrder: 3,
        },
      ],
    });
    console.log("Seeded trust badges");
  }

  const faqCount = await prisma.faqItem.count();
  if (faqCount === 0) {
    await prisma.faqItem.createMany({
      data: [
        {
          question: "How long does delivery take?",
          answer:
            "Most orders are processed within 24 hours and typically delivered in 2–5 business days across Bangladesh, depending on your district.",
          sortOrder: 0,
        },
        {
          question: "Do you offer Cash on Delivery?",
          answer:
            "Yes. Cash on Delivery is available for eligible areas and orders. You’ll see COD as an option at checkout when it’s supported for your address.",
          sortOrder: 1,
        },
        {
          question: "Are your products lab tested?",
          answer:
            "Yes. Our supplements follow quality-focused sourcing and lab-tested standards so you can trust what’s in every bottle.",
          sortOrder: 2,
        },
        {
          question: "How can I track my order?",
          answer:
            "After placing an order, track status anytime from My Orders in your account — from payment confirmation through shipping and delivery.",
          sortOrder: 3,
        },
        {
          question: "What is your return policy?",
          answer:
            "If there’s an issue with your order or product condition, contact support within the return window and we’ll help resolve it quickly.",
          sortOrder: 4,
        },
      ],
    });
    console.log("Seeded FAQ items");
  }

  await prisma.siteSetting.upsert({
    where: { key: "about_home" },
    create: {
      key: "about_home",
      value: {
        eyebrow: "About Us",
        heading: "Well Health Trade International",
        description:
          "We improve everyday wellbeing with high-quality, safe, and effective health supplements — built on innovation, careful quality assurance, and genuine customer care.",
        imageUrl:
          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Well Health clinical wellness and care",
        highlights: [
          "Lab-tested formulations you can trust",
          "GMP-aligned manufacturing standards",
          "Clear guidance for everyday wellness",
        ],
        ctaLabel: "Read More",
        ctaHref: "/about",
        features: [
          { iconKey: "Target", title: "Our Mission", description: "Better Health, Better Tomorrow" },
          { iconKey: "Gem", title: "Our Vision", description: "Global Health For Everyone" },
          {
            iconKey: "HeartHandshake",
            title: "Our Values",
            description: "Quality · Integrity · Care · Innovation",
          },
          {
            iconKey: "Award",
            title: "Why Choose Us",
            description: "Trusted Quality, Customer First",
          },
        ],
      },
    },
    update: {},
  });

  await prisma.siteSetting.upsert({
    where: { key: "site_assets" },
    create: {
      key: "site_assets",
      value: {
        logoLightUrl: "",
        logoDarkUrl: "",
        faviconUrl: "",
        ogImageUrl: "",
      },
    },
    update: {},
  });

  await prisma.siteSetting.upsert({
    where: { key: "store_settings" },
    create: {
      key: "store_settings",
      value: {
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
      },
    },
    update: {},
  });

  console.log("Homepage content + store settings ready");

  const notificationCount = await prisma.adminNotification.count();
  if (notificationCount === 0) {
    const now = Date.now();
    await prisma.adminNotification.createMany({
      data: [
        {
          type: "ORDER",
          title: "New order received",
          message: "WHT-2026-00048 · Ayesha Rahman · ৳ 4,250.00",
          href: "/admin/orders",
          isRead: false,
          createdAt: new Date(now - 12 * 60_000),
        },
        {
          type: "PRODUCT",
          title: "Low stock alert",
          message: "Omega-3 Softgels is below the threshold (8 left).",
          href: "/admin/products",
          isRead: false,
          createdAt: new Date(now - 55 * 60_000),
        },
        {
          type: "CUSTOMER",
          title: "New customer registered",
          message: "Tanvir Hasan created an account via Google.",
          href: "/admin/customers",
          isRead: false,
          createdAt: new Date(now - 3 * 60 * 60_000),
        },
        {
          type: "BLOG",
          title: "Draft ready to publish",
          message: "“Daily Vitamin Habits” is still in draft.",
          href: "/admin/blog",
          isRead: true,
          createdAt: new Date(now - 26 * 60 * 60_000),
        },
        {
          type: "SYSTEM",
          title: "Store settings updated",
          message: "Contact details and free-shipping minimum were saved.",
          href: "/admin/settings",
          isRead: true,
          createdAt: new Date(now - 2 * 24 * 60 * 60_000),
        },
      ],
    });
    console.log("Seeded admin notifications");
  }

  const couponCount = await prisma.coupon.count();
  if (couponCount === 0) {
    const now = Date.now();
    await prisma.coupon.createMany({
      data: [
        {
          code: "WELL10",
          name: "Welcome 10%",
          description: "New customer welcome discount on first order.",
          type: "PERCENT",
          value: 10,
          minOrderAmount: 1500,
          maxDiscount: 500,
          usageLimit: 500,
          usageCount: 42,
          perCustomerLimit: 1,
          startsAt: new Date(now - 7 * 24 * 60 * 60_000),
          endsAt: new Date(now + 60 * 24 * 60 * 60_000),
          isActive: true,
        },
        {
          code: "HEALTH500",
          name: "Flat ৳500 off",
          description: "Fixed discount for orders above ৳3,000.",
          type: "FIXED",
          value: 500,
          minOrderAmount: 3000,
          maxDiscount: null,
          usageLimit: 200,
          usageCount: 18,
          perCustomerLimit: 2,
          startsAt: new Date(now - 3 * 24 * 60 * 60_000),
          endsAt: new Date(now + 30 * 24 * 60 * 60_000),
          isActive: true,
        },
        {
          code: "RAMADAN25",
          name: "Ramadan campaign",
          description: "Scheduled seasonal promo — 25% off.",
          type: "PERCENT",
          value: 25,
          minOrderAmount: 2000,
          maxDiscount: 1000,
          usageLimit: 1000,
          usageCount: 0,
          perCustomerLimit: 1,
          startsAt: new Date(now + 14 * 24 * 60 * 60_000),
          endsAt: new Date(now + 45 * 24 * 60 * 60_000),
          isActive: true,
        },
      ],
    });
    console.log("Seeded sample coupons");
  }

  const reviewCount = await prisma.productReview.count();
  if (reviewCount === 0) {
    const products = await prisma.product.findMany({
      take: 4,
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true },
    });
    if (products.length > 0) {
      const now = Date.now();
      const samples = [
        {
          productId: products[0]!.id,
          customerName: "Ayesha Rahman",
          customerEmail: "ayesha@example.com",
          rating: 5,
          title: "Noticeable eye comfort",
          comment:
            "Using Vision Guard for two weeks — screen fatigue feels lighter and the capsule quality is excellent.",
          status: "APPROVED" as const,
          isFeatured: true,
          adminReply: "Thank you, Ayesha. Glad it’s supporting your daily routine.",
          createdAt: new Date(now - 2 * 24 * 60 * 60_000),
        },
        {
          productId: products[1 % products.length]!.id,
          customerName: "Tanvir Hasan",
          customerEmail: "tanvir@example.com",
          rating: 4,
          title: "Good focus blend",
          comment:
            "Brain support formula is solid. Would love a larger pack size next time.",
          status: "PENDING" as const,
          isFeatured: false,
          adminReply: null,
          createdAt: new Date(now - 8 * 60 * 60_000),
        },
        {
          productId: products[2 % products.length]!.id,
          customerName: "Nusrat Jahan",
          customerEmail: "nusrat@example.com",
          rating: 5,
          title: "Trusted Omega",
          comment: "Lab-tested claim feels genuine. Packaging is premium and delivery was fast.",
          status: "APPROVED" as const,
          isFeatured: true,
          adminReply: null,
          createdAt: new Date(now - 5 * 24 * 60 * 60_000),
        },
        {
          productId: products[3 % products.length]!.id,
          customerName: "Rakib Ahmed",
          customerEmail: "rakib@example.com",
          rating: 2,
          title: "Expected stronger effect",
          comment: "Maybe too early to judge, but I didn’t feel much difference in week one.",
          status: "REJECTED" as const,
          isFeatured: false,
          adminReply: "Thanks for the honesty — results often show after consistent use. Happy to help via support.",
          createdAt: new Date(now - 10 * 24 * 60 * 60_000),
        },
      ];

      await prisma.productReview.createMany({ data: samples });
      console.log("Seeded sample product reviews");
    }
  }

  const zoneCount = await prisma.shippingZone.count();
  if (zoneCount === 0) {
    await prisma.shippingZone.createMany({
      data: [
        {
          name: "Dhaka Metro",
          slug: "dhaka-metro",
          description: "Inside Dhaka city corporation areas",
          areas: "Gulshan, Banani, Dhanmondi, Mirpur, Uttara, Mohammadpur, Motijheel",
          baseFee: 70,
          freeShippingMin: 1500,
          etaMinDays: 1,
          etaMaxDays: 2,
          codAvailable: true,
          isActive: true,
          sortOrder: 0,
        },
        {
          name: "Greater Dhaka",
          slug: "greater-dhaka",
          description: "Nearby districts around the capital",
          areas: "Gazipur, Narayanganj, Savar, Keraniganj",
          baseFee: 100,
          freeShippingMin: 2000,
          etaMinDays: 1,
          etaMaxDays: 3,
          codAvailable: true,
          isActive: true,
          sortOrder: 1,
        },
        {
          name: "Outside Dhaka",
          slug: "outside-dhaka",
          description: "Rest of Bangladesh — district towns & villages",
          areas: "Chattogram, Sylhet, Rajshahi, Khulna, Barishal, Rangpur, Mymensingh",
          baseFee: 130,
          freeShippingMin: 2500,
          etaMinDays: 2,
          etaMaxDays: 5,
          codAvailable: true,
          isActive: true,
          sortOrder: 2,
        },
      ],
    });
    console.log("Seeded shipping zones");
  }

  const courierCount = await prisma.shippingCourier.count();
  if (courierCount === 0) {
    await prisma.shippingCourier.createMany({
      data: [
        {
          name: "Steadfast",
          slug: "steadfast",
          contactPhone: "+8809617612144",
          trackingUrl: "https://steadfast.com.bd/",
          notes: "Reliable nationwide parcel delivery with COD support.",
          isActive: true,
          sortOrder: 0,
        },
        {
          name: "Pathao Parcel",
          slug: "pathao-parcel",
          contactPhone: "+8809666700700",
          trackingUrl: "https://pathao.com/",
          notes: "Fast metro & major city delivery.",
          isActive: true,
          sortOrder: 1,
        },
        {
          name: "RedX",
          slug: "redx",
          contactPhone: "+8809612006060",
          trackingUrl: "https://redx.com.bd/",
          notes: "Strong coverage across district hubs.",
          isActive: true,
          sortOrder: 2,
        },
      ],
    });
    console.log("Seeded shipping couriers");
  }

  const campaignCount = await prisma.marketingCampaign.count();
  if (campaignCount === 0) {
    await prisma.marketingCampaign.createMany({
      data: [
        {
          name: "Welcome wellness series",
          channel: "EMAIL",
          audience: "ALL_CUSTOMERS",
          subject: "Your Well Health journey starts here",
          body: "Thank you for trusting Well Health.\nExplore doctor-recommended supplements crafted for Bangladesh families.\nShop immunity, vitamins, and daily wellness essentials today.",
          status: "DRAFT",
        },
        {
          name: "Flash restock alert",
          channel: "SMS",
          audience: "VIP",
          subject: null,
          body: "Well Health VIP: Immunity Shield is back in stock. Order now before it sells out again. Reply STOP to opt out.",
          status: "DRAFT",
        },
      ],
    });
    console.log("Seeded marketing campaign drafts");
  }

  const messageCount = await prisma.contactMessage.count();
  if (messageCount === 0) {
    await prisma.contactMessage.createMany({
      data: [
        {
          name: "Farhana Akter",
          phone: "01711223344",
          email: "farhana@example.com",
          subject: "Delivery time for Dhaka Metro",
          message:
            "Assalamualaikum. I ordered Immunity Shield yesterday. How long does delivery usually take inside Gulshan?",
          status: "NEW",
          source: "contact",
        },
        {
          name: "Rafiul Hasan",
          phone: "01855667788",
          email: "rafiul@example.com",
          subject: "Bulk order for clinic",
          message:
            "We run a small clinic in Chattogram and want wholesale pricing for Digest Ease Pro (50 bottles). Please share a quote.",
          status: "READ",
          source: "home",
          adminNotes: "Forwarded to sales — waiting on MOQ confirmation.",
        },
      ],
    });
    console.log("Seeded contact inbox messages");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
