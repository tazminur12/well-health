import { BRAND_NAME } from "@/lib/branding";
import type { PublicBlogPost } from "@/lib/blog/public-queries";
import type { AdminFaqItem } from "@/lib/content/mapper";
import type { PublicProduct } from "@/lib/products/public-types";
import type { StoreSettings } from "@/lib/settings/schemas";

import { buildBreadcrumbSchema, buildJsonLdGraph } from "./breadcrumbs";
import { resolveLogoUrl } from "./organization";
import { buildCanonicalUrl, getSiteUrl } from "./site";

type WebPageSchemaInput = {
  path: string;
  name: string;
  description: string;
};

function buildWebPageSchema({ path, name, description }: WebPageSchemaInput) {
  const url = buildCanonicalUrl(path);
  const siteUrl = getSiteUrl();

  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    isPartOf: { "@id": `${siteUrl}/#website` },
    about: { "@id": `${siteUrl}/#organization` },
    inLanguage: "en-BD",
  };
}

export function buildHomePageStructuredData({
  settings,
  ogImage,
  faqs,
}: {
  settings: StoreSettings;
  ogImage?: string;
  faqs: AdminFaqItem[];
}) {
  const siteUrl = getSiteUrl();
  const logoUrl = resolveLogoUrl(ogImage);
  const nodes: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/#webpage`,
      url: siteUrl,
      name: settings.seoTitle || settings.storeName || BRAND_NAME,
      description:
        settings.seoDescription ||
        "Shop premium health supplements from Well Health Trade International — clinical quality, science-backed formulas, and trusted delivery across Bangladesh.",
      isPartOf: { "@id": `${siteUrl}/#website` },
      about: { "@id": `${siteUrl}/#organization` },
      primaryImageOfPage: logoUrl,
      inLanguage: "en-BD",
    },
    buildBreadcrumbSchema([{ name: "Home" }]),
  ];

  if (faqs.length > 0) {
    nodes.push({
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      mainEntity: faqs.slice(0, 12).map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  return buildJsonLdGraph(...nodes);
}

export function buildShopPageStructuredData({
  products,
}: {
  products: PublicProduct[];
}) {
  const shopUrl = buildCanonicalUrl("/shop");

  return buildJsonLdGraph(
    {
      "@type": "CollectionPage",
      "@id": `${shopUrl}#webpage`,
      url: shopUrl,
      name: "Shop Health Supplements",
      description:
        "Browse clinically trusted eye care, brain health, omega, and vitamin supplements from Well Health Trade International.",
      isPartOf: { "@id": `${getSiteUrl()}/#website` },
      inLanguage: "en-BD",
    },
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Shop", path: "/shop" },
    ]),
    {
      "@type": "ItemList",
      name: "Well Health Supplement Catalog",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 30).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: product.name,
        url: buildCanonicalUrl(`/shop/${product.slug}`),
      })),
    }
  );
}

export function buildProductPageStructuredData(product: PublicProduct) {
  const productUrl = buildCanonicalUrl(`/shop/${product.slug}`);
  const images = product.imageUrls.length > 0 ? product.imageUrls : product.imageUrl ? [product.imageUrl] : [];

  return buildJsonLdGraph(
    {
      "@type": "Product",
      "@id": `${productUrl}#product`,
      name: product.name,
      description: product.metaDescription || product.shortDescription,
      image: images,
      sku: product.id,
      category: product.category,
      brand: {
        "@type": "Brand",
        name: product.brand || BRAND_NAME,
      },
      offers: {
        "@type": "Offer",
        url: productUrl,
        priceCurrency: "BDT",
        price: product.price.toFixed(2),
        availability: product.inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@id": `${getSiteUrl()}/#organization` },
      },
    },
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Shop", path: "/shop" },
      { name: product.name, path: `/shop/${product.slug}` },
    ])
  );
}

export function buildContactPageStructuredData({ settings }: { settings: StoreSettings }) {
  const contactUrl = buildCanonicalUrl("/contact");
  const address = [settings.addressLine1, settings.addressLine2, settings.city, settings.country]
    .filter(Boolean)
    .join(", ");

  return buildJsonLdGraph(
    {
      "@type": "ContactPage",
      "@id": `${contactUrl}#webpage`,
      url: contactUrl,
      name: `Contact ${settings.storeName || BRAND_NAME}`,
      description:
        "Contact Well Health Trade International for product questions, order support, and partnership enquiries across Bangladesh.",
      isPartOf: { "@id": `${getSiteUrl()}/#website` },
      inLanguage: "en-BD",
    },
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Contact", path: "/contact" },
    ]),
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      telephone: settings.supportPhone,
      email: settings.supportEmail,
      areaServed: "BD",
      availableLanguage: ["English", "Bengali"],
    },
    {
      "@type": "PostalAddress",
      streetAddress: address,
      addressLocality: settings.city,
      addressCountry: settings.country,
    }
  );
}

export function buildDistributorPageStructuredData() {
  return buildJsonLdGraph(
    buildWebPageSchema({
      path: "/distributor",
      name: "Become a Distributor",
      description:
        "Apply to become an authorized distributor of Well Health Trade International across Bangladesh.",
    }),
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Distributor", path: "/distributor" },
    ])
  );
}

export function buildBlogListingStructuredData({ postCount }: { postCount: number }) {
  const blogUrl = buildCanonicalUrl("/blog");

  return buildJsonLdGraph(
    {
      "@type": "Blog",
      "@id": `${blogUrl}#blog`,
      url: blogUrl,
      name: "Well Health Blog",
      description:
        "Evidence-minded wellness tips, supplement guides, and company updates from Well Health Trade International.",
      isPartOf: { "@id": `${getSiteUrl()}/#website` },
      blogPost: postCount,
      inLanguage: "en-BD",
    },
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
    ])
  );
}

export function buildBlogPostStructuredData(post: PublicBlogPost) {
  const articleUrl = buildCanonicalUrl(`/blog/${post.slug}`);
  const siteUrl = getSiteUrl();

  return buildJsonLdGraph(
    {
      "@type": "BlogPosting",
      "@id": `${articleUrl}#article`,
      headline: post.title,
      description: post.metaDescription || post.excerpt,
      image: post.featuredImageUrl ? [post.featuredImageUrl] : undefined,
      datePublished: post.publishedAt ?? post.createdAt,
      dateModified: post.updatedAt,
      author: {
        "@type": "Person",
        name: post.authorName,
      },
      publisher: {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: BRAND_NAME,
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": articleUrl,
      },
      articleSection: post.category,
      inLanguage: "en-BD",
    },
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ])
  );
}

export function buildLegalPageStructuredData({
  path,
  name,
  description,
}: WebPageSchemaInput) {
  return buildJsonLdGraph(
    buildWebPageSchema({ path, name, description }),
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name, path },
    ])
  );
}
