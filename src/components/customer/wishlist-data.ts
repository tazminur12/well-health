export type WishlistItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  imageTone: string;
  inStock: boolean;
  addedAt: number;
};

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
  })
    .format(value)
    .replace("BDT", "৳");
}

export const wishlistItems: WishlistItem[] = [
  {
    id: "omega-3",
    name: "Omega-3 Fish Oil 1000mg",
    category: "Heart & Brain",
    price: 1450,
    imageTone: "bg-gradient-to-br from-brand-green-100 to-white",
    inStock: true,
    addedAt: 8,
  },
  {
    id: "vitamin-d3",
    name: "Vitamin D3 2000 IU",
    category: "Immunity",
    price: 890,
    imageTone: "bg-gradient-to-br from-amber-50 to-white",
    inStock: true,
    addedAt: 7,
  },
  {
    id: "marine-collagen",
    name: "Marine Collagen Peptides",
    category: "Skin & Joints",
    price: 2200,
    imageTone: "bg-gradient-to-br from-rose-50 to-white",
    inStock: true,
    addedAt: 6,
  },
  {
    id: "daily-probiotic",
    name: "Daily Probiotic 50 Billion CFU",
    category: "Gut Health",
    price: 1650,
    imageTone: "bg-gradient-to-br from-sky-50 to-white",
    inStock: false,
    addedAt: 5,
  },
  {
    id: "ashwagandha",
    name: "Ashwagandha Root Extract",
    category: "Stress & Sleep",
    price: 1180,
    imageTone: "bg-gradient-to-br from-emerald-50 to-white",
    inStock: true,
    addedAt: 4,
  },
  {
    id: "magnesium",
    name: "Magnesium Glycinate",
    category: "Sleep & Recovery",
    price: 1100,
    imageTone: "bg-gradient-to-br from-indigo-50 to-white",
    inStock: true,
    addedAt: 3,
  },
  {
    id: "multivitamin",
    name: "Multivitamin Complete",
    category: "Daily Essentials",
    price: 1950,
    imageTone: "bg-gradient-to-br from-brand-green-100 to-white",
    inStock: true,
    addedAt: 2,
  },
  {
    id: "turmeric",
    name: "Turmeric Curcumin + Black Pepper",
    category: "Joint Support",
    price: 980,
    imageTone: "bg-gradient-to-br from-amber-50 to-white",
    inStock: true,
    addedAt: 1,
  },
];

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
