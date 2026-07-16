import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/dashboard/",
          "/profile/",
          "/orders/",
          "/invite/",
          "/checkout/",
          "/cart/",
          "/wishlist/",
          "/api/",
          "/auth/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
