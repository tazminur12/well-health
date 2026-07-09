import { ProductCard } from "@/components/public/product-card";

type RelatedProductsProps = {
  title?: string;
  products: Array<{ name: string; description: string; price: string }>;
};

export function RelatedProducts({ title = "You May Also Like", products }: RelatedProductsProps) {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <span className="h-8 w-1.5 rounded-full bg-brand-green-600" />
          <h2 className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            {title}
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.name} description={product.description} name={product.name} price={product.price} />
          ))}
        </div>
      </div>
    </section>
  );
}