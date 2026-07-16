import { buildCanonicalUrl } from "./site";

export type BreadcrumbItem = {
  name: string;
  path?: string;
};

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: buildCanonicalUrl(item.path) } : {}),
    })),
  };
}

export function buildJsonLdGraph(...nodes: Record<string, unknown>[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}
