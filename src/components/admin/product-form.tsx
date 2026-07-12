"use client";

import {
  ArrowLeft,
  FlaskConical,
  ImagePlus,
  Loader2,
  Save,
  ShieldCheck,
  Stethoscope,
  UploadCloud,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import {
  type AdminProduct,
  type ProductCategory,
  type ProductStatus,
  PRODUCT_CATEGORIES,
  PRODUCT_UNITS,
  slugifyProductName,
} from "@/components/admin/products-data";
import { Button } from "@/components/ui/button";
import { useAdminProduct, useProductMutations } from "@/hooks/use-admin-products";
import { showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import type { ProductInput } from "@/lib/products/schemas";
import { cn } from "@/lib/utils";

type ProductFormProps = {
  mode: "create" | "edit";
  productId?: string;
};

type FormState = {
  name: string;
  nameBn: string;
  slug: string;
  category: ProductCategory;
  brand: string;
  sku: string;
  barcode: string;
  price: string;
  compareAtPrice: string;
  costPrice: string;
  stock: string;
  lowStockThreshold: string;
  unit: string;
  packSize: string;
  servingSize: string;
  shortDescription: string;
  description: string;
  descriptionBn: string;
  ingredients: string;
  usageInstructions: string;
  warnings: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  featured: boolean;
  labTested: boolean;
  doctorRecommended: boolean;
  status: ProductStatus;
  imageCount: number;
  offerEnabled: boolean;
  offerLabel: string;
  discountPercent: string;
  offerPrice: string;
  offerStartsAt: string;
  offerEndsAt: string;
  offerBadge: "Sale" | "Flash" | "Bundle" | "Clearance";
};

function toDateTimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function productToForm(product?: AdminProduct): FormState {
  if (!product) {
    return {
      name: "",
      nameBn: "",
      slug: "",
      category: "Eye Care",
      brand: "Well Health",
      sku: "",
      barcode: "",
      price: "",
      compareAtPrice: "",
      costPrice: "",
      stock: "0",
      lowStockThreshold: "10",
      unit: "Bottle",
      packSize: "",
      servingSize: "",
      shortDescription: "",
      description: "",
      descriptionBn: "",
      ingredients: "",
      usageInstructions: "",
      warnings: "",
      tags: [],
      metaTitle: "",
      metaDescription: "",
      featured: false,
      labTested: true,
      doctorRecommended: false,
      status: "Draft",
      imageCount: 0,
      offerEnabled: false,
      offerLabel: "",
      discountPercent: "",
      offerPrice: "",
      offerStartsAt: "",
      offerEndsAt: "",
      offerBadge: "Sale",
    };
  }

  return {
    name: product.name,
    nameBn: product.nameBn ?? "",
    slug: product.slug,
    category: product.category,
    brand: product.brand,
    sku: product.sku,
    barcode: product.barcode ?? "",
    price: String(product.price),
    compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
    costPrice: product.costPrice ? String(product.costPrice) : "",
    stock: String(product.stock),
    lowStockThreshold: String(product.lowStockThreshold),
    unit: product.unit,
    packSize: product.packSize ?? "",
    servingSize: product.servingSize ?? "",
    shortDescription: product.shortDescription,
    description: product.description,
    descriptionBn: product.descriptionBn ?? "",
    ingredients: product.ingredients ?? "",
    usageInstructions: product.usageInstructions ?? "",
    warnings: product.warnings ?? "",
    tags: product.tags,
    metaTitle: product.metaTitle ?? "",
    metaDescription: product.metaDescription ?? "",
    featured: product.featured,
    labTested: product.labTested,
    doctorRecommended: product.doctorRecommended,
    status: product.status,
    imageCount: product.imageCount,
    offerEnabled: product.offerEnabled,
    offerLabel: product.offerLabel ?? "",
    discountPercent: product.discountPercent ? String(product.discountPercent) : "",
    offerPrice: product.offerPrice ? String(product.offerPrice) : "",
    offerStartsAt: toDateTimeLocal(product.offerStartsAt),
    offerEndsAt: toDateTimeLocal(product.offerEndsAt),
    offerBadge: product.offerBadge ?? "Sale",
  };
}

export function ProductForm({ mode, productId }: ProductFormProps) {
  const router = useRouter();
  const {
    data: existing,
    isLoading,
    isError,
    error,
  } = useAdminProduct(mode === "edit" ? productId : undefined);
  const { createProduct, updateProduct, uploadImages, deleteImage } =
    useProductMutations();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [slugManual, setSlugManual] = useState(Boolean(existing?.slug));
  const [tagInput, setTagInput] = useState("");
  const [form, setForm] = useState<FormState>(() => productToForm(undefined));
  const [formReady, setFormReady] = useState(mode === "create");
  const [isPending, startTransition] = useTransition();
  const [savedImages, setSavedImages] = useState<
    Array<{ id: string; url: string; isPrimary: boolean }>
  >([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (mode === "create") {
      setForm(productToForm(undefined));
      setSavedImages([]);
      setPendingFiles([]);
      setFormReady(true);
      return;
    }
    if (existing) {
      setForm(productToForm(existing));
      setSavedImages(existing.images ?? []);
      setSlugManual(true);
      setFormReady(true);
    }
  }, [existing, mode]);

  useEffect(() => {
    const urls = pendingFiles.map((file) => URL.createObjectURL(file));
    setPendingPreviews(urls);
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, [pendingFiles]);

  const totalImageCount = savedImages.length + pendingFiles.length;

  const generatedSku = useMemo(() => {
    const prefix =
      form.category === "Eye Care"
        ? "EYE"
        : form.category === "Brain Health"
          ? "BRN"
          : form.category === "Omega"
            ? "OMG"
            : "VIT";
    const stamp = String(Date.now()).slice(-4);
    return `WHT-${prefix}-${stamp}`;
  }, [form.category]);

  const marginPreview = useMemo(() => {
    const price = Number(form.price || 0);
    const cost = Number(form.costPrice || 0);
    if (!price || !cost) return null;
    const margin = ((price - cost) / price) * 100;
    return margin.toFixed(1);
  }, [form.costPrice, form.price]);

  const offerPreview = useMemo(() => {
    const price = Number(form.price || 0);
    const discount = Number(form.discountPercent || 0);
    const offerPrice = form.offerPrice
      ? Number(form.offerPrice)
      : discount > 0 && price > 0
        ? Math.round(price * (1 - discount / 100))
        : null;
    return { offerPrice, discount };
  }, [form.discountPercent, form.offerPrice, form.price]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleNameChange(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: slugManual ? current.slug : slugifyProductName(value),
      metaTitle: current.metaTitle || value,
    }));
  }

  function addTag() {
    const next = tagInput.trim();
    if (!next) return;
    if (form.tags.some((tag) => tag.toLowerCase() === next.toLowerCase())) {
      setTagInput("");
      return;
    }
    update("tags", [...form.tags, next]);
    setTagInput("");
  }

  function validate(): string | null {
    if (!form.name.trim()) return "Product name is required.";
    if (!form.slug.trim()) return "Product slug is required.";
    if (!form.sku.trim() && mode === "edit") return "SKU is required.";
    if (!form.price || Number(form.price) <= 0) return "Enter a valid selling price.";
    if (form.compareAtPrice && Number(form.compareAtPrice) < Number(form.price)) {
      return "Compare-at price should be higher than selling price.";
    }
    if (Number(form.stock) < 0) return "Stock cannot be negative.";
    if (!form.shortDescription.trim()) return "Short description is required.";
    if (!form.description.trim()) return "Full description is required.";
    if (form.offerEnabled) {
      if (!form.offerLabel.trim()) return "Offer label is required when offer is enabled.";
      const discount = Number(form.discountPercent || 0);
      const offerPrice = Number(form.offerPrice || 0);
      if (discount <= 0 && offerPrice <= 0) {
        return "Set a discount % or offer price for the offer.";
      }
      if (discount > 90) return "Discount cannot exceed 90%.";
      if (offerPrice > 0 && Number(form.price) > 0 && offerPrice >= Number(form.price)) {
        return "Offer price must be lower than selling price.";
      }
      if (form.offerStartsAt && form.offerEndsAt) {
        if (new Date(form.offerEndsAt).getTime() <= new Date(form.offerStartsAt).getTime()) {
          return "Offer end date must be after the start date.";
        }
      }
    }
    return null;
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function addFiles(fileList: FileList | File[] | null) {
    if (!fileList) return;
    const incoming = Array.from(fileList).filter((file) =>
      file.type.startsWith("image/")
    );
    if (incoming.length === 0) {
      void showAdminError("Invalid files", "Please choose image files (JPG, PNG, WEBP, GIF).");
      return;
    }

    setPendingFiles((prev) => {
      const room = Math.max(0, 6 - savedImages.length - prev.length);
      if (room === 0) {
        void showAdminError("Limit reached", "Maximum 6 images allowed per product.");
        return prev;
      }
      return [...prev, ...incoming.slice(0, room)];
    });
  }

  function removePendingFile(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function removeSavedImage(imageId: string) {
    if (!productId) {
      setSavedImages((prev) => prev.filter((image) => image.id !== imageId));
      return;
    }
    try {
      await deleteImage.mutateAsync({ productId, imageId });
      setSavedImages((prev) => prev.filter((image) => image.id !== imageId));
      await showAdminSuccess("Image removed", "The image was deleted.");
    } catch (err) {
      await showAdminError(
        "Delete failed",
        err instanceof Error ? err.message : "Could not delete image."
      );
    }
  }

  function handleSubmit(nextStatus?: ProductStatus) {
    const error = validate();
    if (error) {
      void showAdminError("Missing details", error);
      return;
    }

    startTransition(async () => {
      const payload: ProductInput = {
        name: form.name.trim(),
        nameBn: form.nameBn.trim() || undefined,
        slug: form.slug.trim(),
        category: form.category,
        brand: form.brand.trim() || "Well Health",
        sku: form.sku.trim() || generatedSku,
        barcode: form.barcode.trim() || undefined,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
        costPrice: form.costPrice ? Number(form.costPrice) : undefined,
        stock: Number(form.stock || 0),
        lowStockThreshold: Number(form.lowStockThreshold || 10),
        unit: form.unit,
        packSize: form.packSize.trim() || undefined,
        servingSize: form.servingSize.trim() || undefined,
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        descriptionBn: form.descriptionBn.trim() || undefined,
        ingredients: form.ingredients.trim() || undefined,
        usageInstructions: form.usageInstructions.trim() || undefined,
        warnings: form.warnings.trim() || undefined,
        tags: form.tags,
        metaTitle: form.metaTitle.trim() || form.name.trim(),
        metaDescription: form.metaDescription.trim() || form.shortDescription.trim(),
        featured: form.featured,
        labTested: form.labTested,
        doctorRecommended: form.doctorRecommended,
        offerEnabled: form.offerEnabled,
        offerLabel: form.offerEnabled ? form.offerLabel.trim() : undefined,
        discountPercent:
          form.offerEnabled && form.discountPercent
            ? Number(form.discountPercent)
            : undefined,
        offerPrice:
          form.offerEnabled && form.offerPrice
            ? Number(form.offerPrice)
            : form.offerEnabled && offerPreview.offerPrice
              ? offerPreview.offerPrice
              : undefined,
        offerStartsAt:
          form.offerEnabled && form.offerStartsAt
            ? new Date(form.offerStartsAt).toISOString()
            : undefined,
        offerEndsAt:
          form.offerEnabled && form.offerEndsAt
            ? new Date(form.offerEndsAt).toISOString()
            : undefined,
        offerBadge: form.offerEnabled ? form.offerBadge : undefined,
        status: nextStatus ?? form.status,
        imageTone: existing?.imageTone ?? "bg-[linear-gradient(135deg,#eff7f3_0%,#dceee5_100%)]",
        imageCount: savedImages.length + pendingFiles.length,
      };

      try {
        let savedId = productId;
        if (mode === "edit" && productId) {
          await updateProduct.mutateAsync({ id: productId, input: payload });
        } else {
          const created = await createProduct.mutateAsync(payload);
          savedId = created.id;
        }

        if (savedId && pendingFiles.length > 0) {
          await uploadImages.mutateAsync({ id: savedId, files: pendingFiles });
          setPendingFiles([]);
        }

        await showAdminSuccess(
          mode === "edit" ? "Product updated" : "Product created",
          mode === "edit"
            ? "Changes are saved to the database."
            : "The product is now in your catalog."
        );
        router.push("/admin/products");
        router.refresh();
      } catch (err) {
        await showAdminError(
          mode === "edit" ? "Update failed" : "Create failed",
          err instanceof Error ? err.message : "Please try again."
        );
      }
    });
  }

  if (mode === "edit" && isLoading) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <Loader2 className="h-6 w-6 animate-spin text-brand-green-600" />
        Loading product...
      </div>
    );
  }

  if (mode === "edit" && (isError || (!isLoading && !existing))) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h2 className="font-heading text-xl font-bold text-neutral-900">Product not found</h2>
        <p className="mt-2 text-sm text-neutral-500">
          {error instanceof Error ? error.message : "This product may have been deleted."}
        </p>
        <Link
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-green-600 px-5 text-sm font-semibold text-white hover:bg-brand-green-900"
          href="/admin/products"
        >
          Back to products
        </Link>
      </div>
    );
  }

  if (!formReady) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-neutral-500">
        Preparing form...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 text-sm font-medium text-neutral-600 shadow-sm transition-colors duration-200 hover:bg-neutral-50 hover:text-neutral-900"
          href="/admin/products"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            className="h-10 rounded-xl"
            disabled={isPending}
            onClick={() => handleSubmit("Draft")}
            type="button"
            variant="outline"
          >
            Save as Draft
          </Button>
          <Button
            className="h-10 rounded-xl bg-brand-green-600 text-white hover:bg-brand-green-900"
            disabled={isPending}
            onClick={() => handleSubmit("Active")}
            type="button"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {mode === "edit" ? "Update Product" : "Publish Product"}
          </Button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <Section title="Basic information" subtitle="Core catalog identity for storefront and admin.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Product name *" className="sm:col-span-2">
                <input
                  className={inputClass}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder="Vision Guard Plus"
                  value={form.name}
                />
              </Field>

              <Field label="Product name (Bangla)" className="sm:col-span-2">
                <input
                  className={cn(inputClass, "font-bangla")}
                  onChange={(event) => update("nameBn", event.target.value)}
                  placeholder="ভিশন গার্ড প্লাস"
                  value={form.nameBn}
                />
              </Field>

              <Field helper="Used in product URL" label="Slug *">
                <input
                  className={inputClass}
                  onChange={(event) => {
                    setSlugManual(true);
                    update("slug", slugifyProductName(event.target.value));
                  }}
                  placeholder="vision-guard-plus"
                  value={form.slug}
                />
              </Field>

              <Field label="Brand">
                <input
                  className={inputClass}
                  onChange={(event) => update("brand", event.target.value)}
                  value={form.brand}
                />
              </Field>

              <Field label="Category *">
                <select
                  className={inputClass}
                  onChange={(event) => update("category", event.target.value as ProductCategory)}
                  value={form.category}
                >
                  {PRODUCT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="SKU / Product code">
                <input
                  className={inputClass}
                  onChange={(event) => update("sku", event.target.value.toUpperCase())}
                  placeholder={generatedSku}
                  value={form.sku}
                />
              </Field>

              <Field label="Barcode" className="sm:col-span-2">
                <input
                  className={inputClass}
                  onChange={(event) => update("barcode", event.target.value)}
                  placeholder="Optional EAN / UPC"
                  value={form.barcode}
                />
              </Field>
            </div>
          </Section>

          <Section title="Pricing & inventory" subtitle="Bangladesh market pricing with stock controls.">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Selling price (৳) *">
                <input
                  className={inputClass}
                  min={0}
                  onChange={(event) => update("price", event.target.value)}
                  type="number"
                  value={form.price}
                />
              </Field>
              <Field label="Compare-at price (৳)">
                <input
                  className={inputClass}
                  min={0}
                  onChange={(event) => update("compareAtPrice", event.target.value)}
                  type="number"
                  value={form.compareAtPrice}
                />
              </Field>
              <Field helper={marginPreview ? `Margin ~ ${marginPreview}%` : undefined} label="Cost price (৳)">
                <input
                  className={inputClass}
                  min={0}
                  onChange={(event) => update("costPrice", event.target.value)}
                  type="number"
                  value={form.costPrice}
                />
              </Field>
              <Field label="Stock quantity">
                <input
                  className={inputClass}
                  min={0}
                  onChange={(event) => update("stock", event.target.value)}
                  type="number"
                  value={form.stock}
                />
              </Field>
              <Field label="Low stock threshold">
                <input
                  className={inputClass}
                  min={0}
                  onChange={(event) => update("lowStockThreshold", event.target.value)}
                  type="number"
                  value={form.lowStockThreshold}
                />
              </Field>
              <Field label="Unit">
                <select
                  className={inputClass}
                  onChange={(event) => update("unit", event.target.value)}
                  value={form.unit}
                >
                  {PRODUCT_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Pack size">
                <input
                  className={inputClass}
                  onChange={(event) => update("packSize", event.target.value)}
                  placeholder="60 capsules"
                  value={form.packSize}
                />
              </Field>
              <Field className="sm:col-span-2 lg:col-span-2" label="Serving size">
                <input
                  className={inputClass}
                  onChange={(event) => update("servingSize", event.target.value)}
                  placeholder="1 capsule daily"
                  value={form.servingSize}
                />
              </Field>
            </div>
          </Section>

          <Section
            title="Offer & promotions"
            subtitle="Limited-time deals shown on storefront cards and product pages."
          >
            <div className="space-y-4">
              <ToggleRow
                checked={form.offerEnabled}
                description="Enable a campaign price or discount badge for this product"
                label="Enable offer"
                onChange={(value) => update("offerEnabled", value)}
              />

              {form.offerEnabled ? (
                <div className="grid gap-4 rounded-2xl border border-brand-green-100 bg-brand-green-100/30 p-4 sm:grid-cols-2">
                  <Field label="Offer label *">
                    <input
                      className={inputClass}
                      onChange={(event) => update("offerLabel", event.target.value)}
                      placeholder="Summer Wellness Sale"
                      value={form.offerLabel}
                    />
                  </Field>

                  <Field label="Offer badge">
                    <select
                      className={inputClass}
                      onChange={(event) =>
                        update(
                          "offerBadge",
                          event.target.value as FormState["offerBadge"]
                        )
                      }
                      value={form.offerBadge}
                    >
                      <option value="Sale">Sale</option>
                      <option value="Flash">Flash</option>
                      <option value="Bundle">Bundle</option>
                      <option value="Clearance">Clearance</option>
                    </select>
                  </Field>

                  <Field helper="Auto-calculates offer price if left blank" label="Discount %">
                    <input
                      className={inputClass}
                      max={90}
                      min={0}
                      onChange={(event) => update("discountPercent", event.target.value)}
                      type="number"
                      value={form.discountPercent}
                    />
                  </Field>

                  <Field
                    helper={
                      offerPreview.offerPrice
                        ? `Preview offer price: ৳ ${offerPreview.offerPrice.toLocaleString("en-BD")}`
                        : undefined
                    }
                    label="Offer price (৳)"
                  >
                    <input
                      className={inputClass}
                      min={0}
                      onChange={(event) => update("offerPrice", event.target.value)}
                      placeholder="Optional override"
                      type="number"
                      value={form.offerPrice}
                    />
                  </Field>

                  <Field label="Offer starts">
                    <input
                      className={inputClass}
                      onChange={(event) => update("offerStartsAt", event.target.value)}
                      type="datetime-local"
                      value={form.offerStartsAt}
                    />
                  </Field>

                  <Field label="Offer ends">
                    <input
                      className={inputClass}
                      onChange={(event) => update("offerEndsAt", event.target.value)}
                      type="datetime-local"
                      value={form.offerEndsAt}
                    />
                  </Field>

                  <div className="sm:col-span-2 rounded-xl border border-white/80 bg-white px-4 py-3 text-sm text-neutral-600">
                    <p className="font-semibold text-neutral-900">Storefront preview</p>
                    <p className="mt-1">
                      Badge:{" "}
                      <span className="inline-flex rounded-full bg-[#C9A24B]/15 px-2.5 py-0.5 text-xs font-semibold text-[#8a6d2d]">
                        {form.offerBadge}
                        {offerPreview.discount ? ` · ${offerPreview.discount}% OFF` : ""}
                      </span>
                      {form.offerLabel ? (
                        <span className="ml-2 text-neutral-500">“{form.offerLabel}”</span>
                      ) : null}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
                  Turn on offer to set discount percentage, campaign dates, and storefront badge.
                </p>
              )}
            </div>
          </Section>

          <Section title="Product details" subtitle="Copy shown on PDP and search snippets.">
            <div className="grid gap-4">
              <Field label="Short description *">
                <input
                  className={inputClass}
                  maxLength={140}
                  onChange={(event) => update("shortDescription", event.target.value)}
                  placeholder="One-line benefit statement"
                  value={form.shortDescription}
                />
              </Field>
              <Field label="Full description *">
                <textarea
                  className={cn(inputClass, "min-h-[120px] py-2.5")}
                  onChange={(event) => update("description", event.target.value)}
                  rows={5}
                  value={form.description}
                />
              </Field>
              <Field label="Description (Bangla)">
                <textarea
                  className={cn(inputClass, "min-h-[100px] py-2.5 font-bangla")}
                  onChange={(event) => update("descriptionBn", event.target.value)}
                  rows={4}
                  value={form.descriptionBn}
                />
              </Field>
              <Field label="Ingredients">
                <textarea
                  className={cn(inputClass, "min-h-[90px] py-2.5")}
                  onChange={(event) => update("ingredients", event.target.value)}
                  placeholder="Key actives and composition"
                  rows={3}
                  value={form.ingredients}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Usage instructions">
                  <textarea
                    className={cn(inputClass, "min-h-[90px] py-2.5")}
                    onChange={(event) => update("usageInstructions", event.target.value)}
                    rows={3}
                    value={form.usageInstructions}
                  />
                </Field>
                <Field label="Warnings">
                  <textarea
                    className={cn(inputClass, "min-h-[90px] py-2.5")}
                    onChange={(event) => update("warnings", event.target.value)}
                    rows={3}
                    value={form.warnings}
                  />
                </Field>
              </div>
            </div>
          </Section>

          <Section
            title="Media"
            subtitle="Upload product photos. Saved to local storage for now; Cloudinary comes later."
          >
            <input
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              multiple
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
              ref={fileInputRef}
              type="file"
            />

            <button
              className={cn(
                "flex w-full flex-col items-center justify-center rounded-2xl border border-dashed bg-neutral-50 px-4 py-10 text-center transition-colors duration-200",
                isDragging
                  ? "border-brand-green-600 bg-brand-green-100/50"
                  : "border-neutral-300 hover:border-brand-green-600 hover:bg-brand-green-100/40",
                totalImageCount >= 6 && "cursor-not-allowed opacity-60"
              )}
              disabled={totalImageCount >= 6}
              onClick={openFilePicker}
              onDragLeave={(event) => {
                event.preventDefault();
                setIsDragging(false);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                addFiles(event.dataTransfer.files);
              }}
              type="button"
            >
              <UploadCloud className="h-8 w-8 text-brand-green-600" />
              <p className="mt-3 text-sm font-semibold text-neutral-800">Add product images</p>
              <p className="mt-1 text-xs text-neutral-500">
                Click or drag & drop · PNG, JPG, WEBP up to 5MB · max 6 images
              </p>
              <p className="mt-2 text-xs font-medium text-brand-green-600">
                {totalImageCount}/6 selected
              </p>
            </button>

            {totalImageCount > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {savedImages.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="Product"
                      className="h-full w-full object-cover"
                      src={image.url}
                    />
                    {image.isPrimary ? (
                      <span className="absolute left-2 top-2 rounded-full bg-brand-green-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        Primary
                      </span>
                    ) : null}
                    <button
                      aria-label="Remove image"
                      className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-neutral-500 shadow-sm hover:text-red-600"
                      onClick={() => void removeSavedImage(image.id)}
                      type="button"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {pendingPreviews.map((preview, index) => (
                  <div
                    key={`pending-${preview}`}
                    className="relative aspect-square overflow-hidden rounded-xl border border-dashed border-brand-green-600/40 bg-neutral-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={`New upload ${index + 1}`}
                      className="h-full w-full object-cover"
                      src={preview}
                    />
                    <span className="absolute left-2 top-2 rounded-full bg-neutral-900/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      New
                    </span>
                    <button
                      aria-label="Remove pending image"
                      className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-neutral-500 shadow-sm hover:text-red-600"
                      onClick={() => removePendingFile(index)}
                      type="button"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 flex aspect-[4/1] items-center justify-center rounded-xl border border-neutral-200 bg-[linear-gradient(135deg,#f3faf6_0%,#e4f2eb_100%)]">
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <ImagePlus className="h-5 w-5" />
                  No images yet
                </div>
              </div>
            )}
          </Section>

          <Section title="SEO" subtitle="Search preview metadata for product pages.">
            <div className="grid gap-4">
              <Field label="Meta title">
                <input
                  className={inputClass}
                  maxLength={70}
                  onChange={(event) => update("metaTitle", event.target.value)}
                  value={form.metaTitle}
                />
              </Field>
              <Field label="Meta description">
                <textarea
                  className={cn(inputClass, "min-h-[90px] py-2.5")}
                  maxLength={160}
                  onChange={(event) => update("metaDescription", event.target.value)}
                  rows={3}
                  value={form.metaDescription}
                />
              </Field>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Search preview</p>
                <p className="mt-2 font-heading text-base font-semibold text-[#1a0dab]">
                  {form.metaTitle || form.name || "Product title"}
                </p>
                <p className="text-xs text-brand-green-600">
                  wellhealthint.com/shop/{form.slug || "product-slug"}
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  {form.metaDescription || form.shortDescription || "Meta description appears here."}
                </p>
              </div>
            </div>
          </Section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <Section title="Visibility" subtitle="Publish controls">
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-neutral-700">Status</p>
                <div className="grid grid-cols-3 gap-2">
                  {(["Draft", "Active", "Archived"] as ProductStatus[]).map((status) => (
                    <button
                      key={status}
                      className={cn(
                        "rounded-xl border px-2 py-2 text-xs font-semibold transition-colors duration-200",
                        form.status === status
                          ? "border-brand-green-600 bg-brand-green-100 text-brand-green-900"
                          : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                      )}
                      onClick={() => update("status", status)}
                      type="button"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <ToggleRow
                checked={form.featured}
                description="Show in featured homepage modules"
                label="Featured product"
                onChange={(value) => update("featured", value)}
              />
            </div>
          </Section>

          <Section title="Trust signals" subtitle="Clinical credibility badges">
            <div className="space-y-3">
              <ToggleRow
                checked={form.labTested}
                description="Show lab-tested badge"
                icon={FlaskConical}
                label="Lab tested"
                onChange={(value) => update("labTested", value)}
              />
              <ToggleRow
                checked={form.doctorRecommended}
                description="Doctor-recommended highlight"
                icon={Stethoscope}
                label="Doctor recommended"
                onChange={(value) => update("doctorRecommended", value)}
              />
              <div className="rounded-xl border border-brand-green-100 bg-brand-green-100/50 px-3 py-3 text-xs leading-5 text-brand-green-900">
                <ShieldCheck className="mb-1 inline h-3.5 w-3.5" /> Trust badges help conversion on health catalogs.
              </div>
            </div>
          </Section>

          <Section title="Tags" subtitle="Filtering & search helpers">
            <div className="flex gap-2">
              <input
                className={inputClass}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tag"
                value={tagInput}
              />
              <Button className="h-11 rounded-xl" onClick={addTag} type="button" variant="outline">
                Add
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {form.tags.map((tag) => (
                <button
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-red-50 hover:text-red-600"
                  onClick={() => update(
                    "tags",
                    form.tags.filter((item) => item !== tag)
                  )}
                  type="button"
                >
                  {tag}
                  <X className="h-3 w-3" />
                </button>
              ))}
              {form.tags.length === 0 ? (
                <p className="text-xs text-neutral-500">No tags yet</p>
              ) : null}
            </div>
          </Section>
        </aside>
      </div>
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-800 outline-none transition-all duration-200 focus:border-brand-green-600 focus:ring-4 focus:ring-brand-green-100";

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 border-b border-neutral-100 pb-3">
        <h2 className="font-heading text-base font-bold text-neutral-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-neutral-500">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  helper,
  className,
  children,
}: {
  label: string;
  helper?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      {children}
      {helper ? <span className="block text-xs text-neutral-500">{helper}</span> : null}
    </label>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  icon: Icon,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-neutral-200 px-3 py-3">
      <div className="min-w-0">
        <p className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-800">
          {Icon ? <Icon className="h-3.5 w-3.5 text-brand-green-600" /> : null}
          {label}
        </p>
        <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
      </div>
      <button
        aria-checked={checked}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200",
          checked ? "bg-brand-green-600" : "bg-neutral-300"
        )}
        onClick={() => onChange(!checked)}
        role="switch"
        type="button"
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}
