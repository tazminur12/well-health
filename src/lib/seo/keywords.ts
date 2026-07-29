/** Shared SEO keyword sets for public marketing pages (EN + BN for Bangladesh search). */
export const SEO_KEYWORDS = {
  core: [
    "Well Health Trade International",
    "Well Health supplements",
    "health supplements Bangladesh",
    "vitamin supplements Dhaka",
    "buy supplements online Bangladesh",
    "স্বাস্থ্য সাপ্লিমেন্ট বাংলাদেশ",
    "ভিটামিন সাপ্লিমেন্ট ঢাকা",
    "অনলাইনে সাপ্লিমেন্ট কিনুন",
    "ওয়েল হেলথ সাপ্লিমেন্ট",
  ],
  home: [
    "Well Health Trade International",
    "health supplements Bangladesh",
    "buy vitamins online Dhaka",
    "clinical premium supplements",
    "omega supplements BD",
    "eye care supplements Bangladesh",
    "wellness products Bangladesh",
    "natural health supplements",
    "স্বাস্থ্য সাপ্লিমেন্ট বাংলাদেশ",
    "ভিটামিন কিনুন অনলাইন ঢাকা",
    "ওমেগা সাপ্লিমেন্ট",
    "চোখের যত্ন সাপ্লিমেন্ট",
    "প্রিমিয়াম স্বাস্থ্য পণ্য",
    "হার্বাল সাপ্লিমেন্ট বাংলাদেশ",
  ],
  shop: [
    "buy health supplements Bangladesh",
    "vitamin shop Dhaka",
    "omega 3 supplements BD",
    "eye care supplements",
    "brain health supplements",
    "Well Health shop",
    "supplements online Bangladesh",
    "স্বাস্থ্য সাপ্লিমেন্ট শপ",
    "ভিটামিন শপ ঢাকা",
    "ওমেগা ৩ সাপ্লিমেন্ট",
    "ব্রেন হেলথ সাপ্লিমেন্ট",
    "অনলাইন সাপ্লিমেন্ট কেনা",
  ],
  contact: [
    "Well Health contact",
    "supplement company contact Dhaka",
    "health supplement support Bangladesh",
    "Well Health phone number",
    "Well Health customer service",
    "ওয়েল হেলথ যোগাযোগ",
    "সাপ্লিমেন্ট কাস্টমার সার্ভিস",
    "স্বাস্থ্য পণ্য সাপোর্ট ঢাকা",
  ],
  distributor: [
    "supplement distributor Bangladesh",
    "health product distributor Dhaka",
    "become supplement distributor BD",
    "Well Health distributor",
    "pharmacy distributor partnership",
    "সাপ্লিমেন্ট ডিস্ট্রিবিউটর বাংলাদেশ",
    "স্বাস্থ্য পণ্য ডিলার ঢাকা",
    "ওয়েল হেলথ ডিস্ট্রিবিউটর",
  ],
  blog: [
    "wellness blog Bangladesh",
    "supplement tips",
    "health advice Bangladesh",
    "Well Health blog",
    "vitamin guide",
    "স্বাস্থ্য ব্লগ বাংলাদেশ",
    "সাপ্লিমেন্ট টিপস",
    "ভিটামিন গাইড বাংলা",
  ],
  about: [
    "Well Health Trade International",
    "health supplements Bangladesh",
    "vitamin supplements Dhaka",
    "clinical premium supplements",
    "wellness brand Bangladesh",
    "supplement company Bangladesh",
    "about Well Health",
    "ওয়েল হেলথ ট্রেড ইন্টারন্যাশনাল",
    "স্বাস্থ্য সাপ্লিমেন্ট কোম্পানি বাংলাদেশ",
    "ওয়েল হেলথ সম্পর্কে",
  ],
  legal: [
    "Well Health terms",
    "Well Health privacy policy",
    "supplement store policies Bangladesh",
    "ওয়েল হেলথ শর্তাবলী",
    "ওয়েল হেলথ প্রাইভেসি পলিসি",
  ],
} as const;

/** Default EN + BN root keywords (main layout / fallback). */
export const ROOT_SEO_KEYWORDS = [
  ...SEO_KEYWORDS.core,
  "clinical premium supplements",
  "natural wellness products BD",
  "GMP health supplements",
  "herbal supplements Bangladesh",
  "wellness brand Bangladesh",
  "প্রিমিয়াম স্বাস্থ্য সাপ্লিমেন্ট",
  "ক্লিনিক্যাল কোয়ালিটি সাপ্লিমেন্ট",
  "হার্বাল সাপ্লিমেন্ট বাংলাদেশ",
  "স্বাস্থ্য সম্পূরক বাংলাদেশ",
  "ওমেগা ৩ কিনুন বাংলাদেশ",
  "চোখের ভিটামিন সাপ্লিমেন্ট",
] as const;

export const DEFAULT_SEO_DESCRIPTION_EN =
  "Shop premium health supplements from Well Health Trade International — clinical quality, science-backed formulas, and trusted delivery across Bangladesh.";

export const DEFAULT_SEO_DESCRIPTION_BN =
  "বাংলাদেশে প্রিমিয়াম স্বাস্থ্য সাপ্লিমেন্ট — ভিটামিন, ওমেগা, চোখ ও ব্রেন হেলথ ফর্মুলা। Well Health Trade International থেকে বিশ্বস্ত ডেলিভারি।";

/** Bilingual meta description for stronger EN + BN search coverage. */
export const DEFAULT_SEO_DESCRIPTION = `${DEFAULT_SEO_DESCRIPTION_EN} ${DEFAULT_SEO_DESCRIPTION_BN}`;
