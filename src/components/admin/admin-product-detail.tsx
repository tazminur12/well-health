"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  FlaskConical,
  Loader2,
  Pencil,
  Pill,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import {
  formatProductStrength,
  getProductStockBucket,
  routeOfAdminLabel,
} from "@/components/admin/products-data";
import { Button } from "@/components/ui/button";
import { useAdminProduct } from "@/hooks/use-admin-products";
import { formatPrice } from "@/lib/format-price";
import { cn } from "@/lib/utils";

type AdminProductDetailProps = {
  productId: string;
};

export function AdminProductDetail({ productId }: AdminProductDetailProps) {
  const { data: product, isLoading, isError, error, refetch } = useAdminProduct(productId);

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <Loader2 className="h-6 w-6 animate-spin text-brand-green-600" />
        Loading product…
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h2 className="font-heading text-xl font-bold text-neutral-900">
          Couldn’t load product
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          {error instanceof Error ? error.message : "Product not found."}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button asChild className="rounded-xl" variant="outline">
            <Link href="/admin/products">Back to products</Link>
          </Button>
          <Button className="rounded-xl" onClick={() => void refetch()} type="button">
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const strengthLabel = formatProductStrength(product.strength, product.strengthUnit);
  const stockBucket = getProductStockBucket(product.stock, product.lowStockThreshold);
  const primaryImage = product.images?.find((image) => image.isPrimary)?.url
    ?? product.images?.[0]?.url
    ?? product.imageUrls?.[0];

  const pharmaRows = [
    { label: "Dosage form", value: product.dosageForm },
    { label: "Strength", value: strengthLabel },
    { label: "Packaging unit", value: product.unit },
    { label: "Pack size", value: product.packSize },
    {
      label: "Quantity per pack",
      value: product.quantityPerPack != null ? String(product.quantityPerPack) : undefined,
    },
    {
      label: "Route of administration",
      value: routeOfAdminLabel(product.routeOfAdmin) ?? product.routeOfAdmin,
    },
    { label: "Serving / dose", value: product.servingSize },
    { label: "Generic name", value: product.genericName },
    {
      label: "Prescription",
      value: product.prescriptionRequired ? "Required" : "Not required",
    },
  ].filter((row) => Boolean(row.value));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-brand-green-700"
            href="/admin/products"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to products
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-neutral-900 sm:text-3xl">
              {product.name}
            </h1>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
                product.status === "Active" && "bg-brand-green-100 text-brand-green-800",
                product.status === "Draft" && "bg-neutral-200 text-neutral-600",
                product.status === "Archived" && "bg-amber-100 text-amber-800"
              )}
            >
              {product.status}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-neutral-500">
            {product.sku} · {product.category}
            {product.nameBn ? ` · ${product.nameBn}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild className="rounded-xl" variant="outline">
            <Link href={`/shop/${product.slug}`} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              View storefront
            </Link>
          </Button>
          <Button
            asChild
            className="rounded-xl bg-gradient-to-r from-brand-green-900 to-brand-green-600 text-white hover:from-brand-green-900 hover:to-brand-green-900"
          >
            <Link href={`/admin/products/${product.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit product
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div
            className={cn(
              "relative aspect-square",
              product.imageTone || "bg-[linear-gradient(135deg,#eff7f3_0%,#dceee5_100%)]"
            )}
          >
            {primaryImage ? (
              <Image
                alt={product.name}
                className="object-contain p-6"
                fill
                sizes="280px"
                src={primaryImage}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                No image
              </div>
            )}
          </div>
          <div className="space-y-2 border-t border-neutral-100 p-4 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-neutral-500">Price</span>
              <span className="font-semibold text-neutral-900">{formatPrice(product.price)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-neutral-500">Stock</span>
              <span className="font-semibold text-neutral-900">
                {product.stock} · {stockBucket}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-neutral-500">Images</span>
              <span className="font-semibold text-neutral-900">{product.imageCount}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green-100 text-brand-green-800">
                <Pill className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-heading text-lg font-bold text-neutral-900">
                  Pharmaceutical specs
                </h2>
                <p className="text-xs text-neutral-500">
                  Visible on the customer product details page
                </p>
              </div>
            </div>

            {pharmaRows.length === 0 ? (
              <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-500">
                No pharmaceutical specs yet. Edit the product to add dosage form, strength, pack
                size, and route.
              </p>
            ) : (
              <dl className="grid gap-3 sm:grid-cols-2">
                {pharmaRows.map((row) => (
                  <div
                    key={row.label}
                    className="rounded-xl border border-neutral-100 bg-[#F7F8F9]/80 px-3.5 py-3"
                  >
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                      {row.label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-neutral-900">{row.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-neutral-900">Storefront copy</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">{product.shortDescription}</p>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
              {product.description}
            </p>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-neutral-900">Trust & flags</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {product.labTested ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-green-100 bg-brand-green-50 px-3 py-1 text-xs font-medium text-brand-green-800">
                  <FlaskConical className="h-3.5 w-3.5" />
                  Lab tested
                </span>
              ) : null}
              {product.doctorRecommended ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-green-100 bg-brand-green-50 px-3 py-1 text-xs font-medium text-brand-green-800">
                  <Stethoscope className="h-3.5 w-3.5" />
                  Doctor recommended
                </span>
              ) : null}
              {product.prescriptionRequired ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Prescription required
                </span>
              ) : null}
              {product.featured ? (
                <span className="inline-flex items-center rounded-full border border-[#E8D9B0] bg-[#F5F0E6] px-3 py-1 text-xs font-medium text-[#8A6A24]">
                  Featured
                </span>
              ) : null}
              {!product.labTested &&
              !product.doctorRecommended &&
              !product.prescriptionRequired &&
              !product.featured ? (
                <span className="text-sm text-neutral-500">No special flags set.</span>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
