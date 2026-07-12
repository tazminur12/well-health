export type WishlistItem = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  imageUrl?: string;
  imageTone: string;
  inStock: boolean;
  addedAt: number;
};

export type WishlistSort = "recent" | "price-asc" | "price-desc";

export const wishlistSortOptions: Array<{ value: WishlistSort; label: string }> = [
  { value: "recent", label: "Recently Added" },
  { value: "price-asc", label: "Price Low to High" },
  { value: "price-desc", label: "Price High to Low" },
];

export function sortWishlist(items: WishlistItem[], sort: WishlistSort): WishlistItem[] {
  const copy = [...items];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    default:
      return copy.sort((a, b) => b.addedAt - a.addedAt);
  }
}
