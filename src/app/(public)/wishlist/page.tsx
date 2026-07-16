import type { Metadata } from "next";

import { WishlistPageClient } from "@/components/public/wishlist-page";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Wishlist",
  description: "Your saved Well Health products — ready when you are.",
  path: "/wishlist",
  noIndex: true,
});

export default function PublicWishlistPage() {
  return <WishlistPageClient />;
}
