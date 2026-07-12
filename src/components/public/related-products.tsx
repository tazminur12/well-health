import { ProductCard } from "@/components/public/product-card";
import type { PublicProductCard } from "@/lib/products/public-types";

type RelatedProductsProps = {
  title?: string;
  products: PublicProductCard[];
};

export function RelatedProducts({
  title = "You May Also Like",
  products,
}: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="bg-[#F7F8F9] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <span className="h-8 w-1.5 rounded-full bg-brand-green-600" />
          <h2 className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
