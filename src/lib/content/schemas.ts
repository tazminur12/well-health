import { z } from "zod";

export const trustIconKeySchema = z.enum([
  "ShieldCheck",
  "BadgeCheck",
  "FlaskConical",
  "Stethoscope",
  "Award",
  "Microscope",
]);

export const aboutFeatureIconSchema = z.enum([
  "Target",
  "Gem",
  "HeartHandshake",
  "Award",
  "Leaf",
  "ShieldCheck",
  "BadgeCheck",
]);

export const heroSlideInputSchema = z.object({
  imageUrl: z.string().trim().min(1, "Image is required"),
  alt: z.string().trim().min(2, "Alt text is required"),
  linkUrl: z.string().trim().optional().or(z.literal("")),
  headline: z.string().trim().optional().or(z.literal("")),
  subheading: z.string().trim().optional().or(z.literal("")),
  primaryCtaText: z.string().trim().optional().or(z.literal("")),
  primaryCtaLink: z.string().trim().optional().or(z.literal("")),
  secondaryCtaText: z.string().trim().optional().or(z.literal("")),
  secondaryCtaLink: z.string().trim().optional().or(z.literal("")),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const trustBadgeInputSchema = z.object({
  iconKey: trustIconKeySchema,
  title: z.string().trim().min(2, "Title is required"),
  description: z.string().trim().min(2, "Description is required"),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const faqItemInputSchema = z.object({
  question: z.string().trim().min(5, "Question is required"),
  answer: z.string().trim().min(5, "Answer is required"),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const aboutFeatureSchema = z.object({
  iconKey: aboutFeatureIconSchema,
  title: z.string().trim().min(2),
  description: z.string().trim().min(2),
});

export const aboutHomeSchema = z.object({
  eyebrow: z.string().trim().default("About Us"),
  heading: z.string().trim().min(2, "Heading is required"),
  description: z.string().trim().min(10, "Description is required"),
  imageUrl: z.string().trim().min(1, "Image is required"),
  imageAlt: z.string().trim().default("About Well Health"),
  highlights: z.array(z.string().trim().min(2)).max(6).default([]),
  ctaLabel: z.string().trim().default("Read More"),
  ctaHref: z.string().trim().default("/about"),
  features: z.array(aboutFeatureSchema).max(4).default([]),
});

export const siteAssetsSchema = z.object({
  logoLightUrl: z.string().trim().optional().or(z.literal("")),
  logoDarkUrl: z.string().trim().optional().or(z.literal("")),
  faviconUrl: z.string().trim().optional().or(z.literal("")),
  ogImageUrl: z.string().trim().optional().or(z.literal("")),
});

export type HeroSlideInput = z.infer<typeof heroSlideInputSchema>;
export type TrustBadgeInput = z.infer<typeof trustBadgeInputSchema>;
export type FaqItemInput = z.infer<typeof faqItemInputSchema>;
export type AboutHomeContent = z.infer<typeof aboutHomeSchema>;
export type SiteAssetsContent = z.infer<typeof siteAssetsSchema>;
