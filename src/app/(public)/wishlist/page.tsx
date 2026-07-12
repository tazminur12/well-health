import type { Metadata } from "next";

import { WishlistPageClient } from "@/components/public/wishlist-page";

export const metadata: Metadata = {
  title: "Wishlist | Well Health",
  description: "Your saved Well Health products — ready when you are.",
};

export default function PublicWishlistPage() {
  return <WishlistPageClient />;
}
