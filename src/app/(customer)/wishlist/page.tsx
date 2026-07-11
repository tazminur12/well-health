import type { Metadata } from "next";

import { CustomerWishlist } from "@/components/customer/customer-wishlist";

export const metadata: Metadata = {
  title: "My Wishlist | Well Health",
  description: "Items you've saved for later at Well Health",
};

export default function CustomerWishlistPage() {
  return <CustomerWishlist />;
}
