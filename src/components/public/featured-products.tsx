import Link from "next/link";

import { ProductCard } from "@/components/public/product-card";

const products = [
  {
    name: "Eyecare-B",
    description: "Eye Vitamin & Mineral, 30 Tablets",
    price: "৳ 850.00",
  },
  {
    name: "Brain Health Syrup",
    description: "Omega 3,6,9 with Vitamins & Minerals, 200ml",
    price: "৳ 950.00",
  },
  {
    name: "Omega 3 Softgels",
    description: "EPA 650mg | DHA 450mg, 60 Softgels",
    price: "৳ 1200.00",
  },
];

export function FeaturedProducts() {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="h-8 w-1.5 rounded-full bg-brand-green-600" />
            <h2 className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Our Products
            </h2>
          </div>

          <Link
            className="inline-flex items-center justify-center rounded-lg border border-brand-green-600 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-brand-green-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-green-100 hover:shadow-sm"
            href="/shop"
          >
            View All
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.name}
              description={product.description}
              name={product.name}
              price={product.price}
            />
          ))}
        </div>
      </div>
    </section>
  );
}