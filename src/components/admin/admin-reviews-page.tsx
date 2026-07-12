"use client";

import {
  Check,
  Loader2,
  MessageSquareQuote,
  Plus,
  Search,
  Star,
  StarOff,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  useAdminReviews,
  useReviewMutations,
  useReviewProductOptions,
} from "@/hooks/use-admin-reviews";
import { confirmAdminAction, showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import type {
  AdminReview,
  CreateReviewInput,
  ReviewStatusValue,
} from "@/lib/reviews/schemas";
import { cn } from "@/lib/utils";

type StatusFilter = "All" | ReviewStatusValue;

const emptyCreateForm: CreateReviewInput = {
  productId: "",
  customerName: "",
  customerEmail: "",
  rating: 5,
  title: "",
  comment: "",
  status: "APPROVED",
  isFeatured: false,
  adminReply: "",
};

const inputClass =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-800 outline-none transition focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20";

const statusMeta: Record<
  ReviewStatusValue,
  { label: string; pill: string }
> = {
  PENDING: { label: "Pending", pill: "bg-amber-100 text-amber-900" },
  APPROVED: { label: "Approved", pill: "bg-brand-green-100 text-brand-green-800" },
  REJECTED: { label: "Rejected", pill: "bg-red-100 text-red-800" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            "h-3.5 w-3.5",
            index < rating ? "fill-[#C9A24B] text-[#C9A24B]" : "text-neutral-300"
          )}
        />
      ))}
    </div>
  );
}

export function AdminReviewsPage() {
  const { data: reviews = [], isLoading, isError, error, refetch } = useAdminReviews();
  const { createReview, setStatus, toggleFeatured, updateReply, remove } =
    useReviewMutations();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateReviewInput>(emptyCreateForm);
  const [savingCreate, setSavingCreate] = useState(false);
  const [replying, setReplying] = useState<AdminReview | null>(null);
  const [replyText, setReplyText] = useState("");
  const [savingReply, setSavingReply] = useState(false);

  const { data: products = [] } = useReviewProductOptions(createOpen);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviews.filter((item) => {
      const matchesSearch =
        !q ||
        item.customerName.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.comment.toLowerCase().includes(q) ||
        (item.title ?? "").toLowerCase().includes(q);
      const matchesFilter = filter === "All" ? true : item.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [filter, reviews, search]);

  const stats = useMemo(() => {
    const pending = reviews.filter((r) => r.status === "PENDING").length;
    const approved = reviews.filter((r) => r.status === "APPROVED").length;
    const featured = reviews.filter((r) => r.isFeatured).length;
    const avg =
      reviews.length === 0
        ? 0
        : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return {
      total: reviews.length,
      pending,
      approved,
      featured,
      avg: avg.toFixed(1),
    };
  }, [reviews]);

  async function handleCreate() {
    setSavingCreate(true);
    try {
      await createReview.mutateAsync({
        ...createForm,
        customerEmail: createForm.customerEmail?.trim() || "",
        title: createForm.title?.trim() || "",
        adminReply: createForm.adminReply?.trim() || "",
        isFeatured: createForm.status === "APPROVED" ? createForm.isFeatured : false,
      });
      await showAdminSuccess("Review created", "The review is now in the moderation list.");
      setCreateOpen(false);
      setCreateForm(emptyCreateForm);
    } catch (err) {
      await showAdminError(
        "Create failed",
        err instanceof Error ? err.message : "Please check the fields."
      );
    } finally {
      setSavingCreate(false);
    }
  }

  async function handleStatus(id: string, status: ReviewStatusValue) {
    try {
      await setStatus.mutateAsync({ id, status });
      await showAdminSuccess(
        status === "APPROVED" ? "Approved" : status === "REJECTED" ? "Rejected" : "Updated",
        "Review status saved."
      );
    } catch (err) {
      await showAdminError(
        "Update failed",
        err instanceof Error ? err.message : "Please try again."
      );
    }
  }

  async function handleFeatured(id: string) {
    try {
      await toggleFeatured.mutateAsync(id);
    } catch (err) {
      await showAdminError(
        "Couldn’t update",
        err instanceof Error ? err.message : "Please try again."
      );
    }
  }

  async function handleDelete(review: AdminReview) {
    const ok = await confirmAdminAction({
      title: "Delete this review?",
      text: `From ${review.customerName} on ${review.productName}`,
      confirmText: "Delete",
    });
    if (!ok) return;
    try {
      await remove.mutateAsync(review.id);
      await showAdminSuccess("Deleted", "Review removed.");
    } catch (err) {
      await showAdminError(
        "Delete failed",
        err instanceof Error ? err.message : "Please try again."
      );
    }
  }

  function openReply(review: AdminReview) {
    setReplying(review);
    setReplyText(review.adminReply ?? "");
  }

  async function saveReply() {
    if (!replying) return;
    setSavingReply(true);
    try {
      await updateReply.mutateAsync({ id: replying.id, adminReply: replyText });
      await showAdminSuccess("Reply saved", "Your response is attached to the review.");
      setReplying(null);
    } catch (err) {
      await showAdminError(
        "Save failed",
        err instanceof Error ? err.message : "Please try again."
      );
    } finally {
      setSavingReply(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <Loader2 className="h-6 w-6 animate-spin text-brand-green-600" />
        Loading reviews…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h2 className="font-heading text-xl font-bold text-neutral-900">
          Couldn’t load reviews
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          {error instanceof Error ? error.message : "Something went wrong."}
        </p>
        <Button className="mt-5 rounded-xl" onClick={() => void refetch()} type="button">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-green-100 bg-gradient-to-r from-brand-green-50 to-[#F5F0E6] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-green-800">
            <MessageSquareQuote className="h-3.5 w-3.5" />
            Trust & social proof
          </div>
          <h1 className="mt-3 font-heading text-2xl font-bold text-neutral-900 sm:text-3xl">
            Reviews
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-neutral-500">
            Moderate product feedback, feature standout stories, and reply with a clinical,
            trustworthy voice.
          </p>
        </div>
        <Button
          className="h-10 rounded-xl bg-gradient-to-r from-brand-green-900 to-brand-green-600 text-white shadow-[0_10px_24px_rgba(22,135,93,0.28)] hover:from-brand-green-900 hover:to-brand-green-900"
          onClick={() => {
            setCreateForm(emptyCreateForm);
            setCreateOpen(true);
          }}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Add review
        </Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total reviews" tone="green" value={String(stats.total)} />
        <StatCard label="Pending" tone="gold" value={String(stats.pending)} />
        <StatCard label="Approved" tone="teal" value={String(stats.approved)} />
        <StatCard label="Avg rating" tone="slate" value={stats.avg} />
      </section>

      <div className="overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-[#0B4D3A] via-[#127A56] to-[#16875D] p-5 text-white shadow-[0_18px_40px_rgba(11,77,58,0.2)] sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
              Moderation queue
            </p>
            <p className="mt-1 font-heading text-3xl font-bold tracking-tight">
              {stats.pending} pending
            </p>
            <p className="mt-1 text-sm text-white/75">
              {stats.featured} featured · {stats.approved} live on storefront when wired
            </p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-[#C9A24B] text-[#C9A24B]" />
              <span className="text-sm font-semibold">{stats.avg} / 5.0 average</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-3 text-sm outline-none focus:border-brand-green-600 focus:bg-white focus:ring-2 focus:ring-brand-green-600/15"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, product, or comment…"
            value={search}
          />
        </div>
        <div className="flex flex-wrap gap-1 rounded-xl border border-neutral-200 bg-neutral-50 p-1">
          {(["All", "PENDING", "APPROVED", "REJECTED"] as const).map((item) => (
            <button
              key={item}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                filter === item
                  ? "bg-white text-brand-green-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
              onClick={() => setFilter(item)}
              type="button"
            >
              {item === "All" ? "All" : statusMeta[item].label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-200 bg-gradient-to-br from-white via-[#F7F8F9] to-[#E8F5EE] px-6 py-16 text-center">
          <MessageSquareQuote className="mx-auto h-10 w-10 text-brand-green-600" />
          <h2 className="mt-4 font-heading text-xl font-bold text-neutral-900">
            No reviews found
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">
            {search || filter !== "All"
              ? "Try another search or status filter."
              : "Create a review manually or wait for customer feedback."}
          </p>
          {!search && filter === "All" ? (
            <Button
              className="mt-5 rounded-xl"
              onClick={() => {
                setCreateForm(emptyCreateForm);
                setCreateOpen(true);
              }}
              type="button"
            >
              <Plus className="h-4 w-4" />
              Add review
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => {
            const meta = statusMeta[review.status];
            return (
              <article
                key={review.id}
                className={cn(
                  "overflow-hidden rounded-2xl border bg-gradient-to-br from-white via-white to-[#F7F8F9] shadow-[0_12px_30px_rgba(15,23,42,0.05)]",
                  review.status === "PENDING" && "border-amber-200/80",
                  review.status === "APPROVED" && "border-brand-green-100",
                  review.status === "REJECTED" && "border-red-100"
                )}
              >
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
                  <div className="flex min-w-0 flex-1 gap-3">
                    <span className="relative flex h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-brand-green-50 to-[#F5F0E6] ring-1 ring-neutral-200">
                      {review.productImageUrl ? (
                        <Image
                          alt=""
                          className="object-cover"
                          fill
                          sizes="56px"
                          src={review.productImageUrl}
                          unoptimized
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs font-bold text-brand-green-800">
                          {review.productName.slice(0, 1)}
                        </span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StarRow rating={review.rating} />
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                            meta.pill
                          )}
                        >
                          {meta.label}
                        </span>
                        {review.isFeatured ? (
                          <span className="rounded-full bg-[#F5F0E6] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#8A6E2F]">
                            Featured
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-2 font-heading text-base font-bold text-neutral-900">
                        {review.title || "Customer review"}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-neutral-600">{review.comment}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                        <span className="font-semibold text-neutral-800">
                          {review.customerName}
                        </span>
                        {review.customerEmail ? <span>{review.customerEmail}</span> : null}
                        <span>·</span>
                        <span>{formatDate(review.createdAt)}</span>
                        <span>·</span>
                        <Link
                          className="font-medium text-brand-green-700 hover:underline"
                          href={`/admin/products/${review.productId}/edit`}
                        >
                          {review.productName}
                        </Link>
                        <span className="text-neutral-400">{review.productSku}</span>
                      </div>
                      {review.adminReply ? (
                        <div className="mt-3 rounded-xl border border-brand-green-100 bg-brand-green-50/60 px-3 py-2.5">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-green-800">
                            Admin reply
                          </p>
                          <p className="mt-1 text-sm text-neutral-700">{review.adminReply}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-1.5 sm:flex-col sm:items-stretch">
                    {review.status !== "APPROVED" ? (
                      <ActionBtn
                        onClick={() => void handleStatus(review.id, "APPROVED")}
                        tone="green"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        Approve
                      </ActionBtn>
                    ) : null}
                    {review.status !== "REJECTED" ? (
                      <ActionBtn
                        onClick={() => void handleStatus(review.id, "REJECTED")}
                        tone="red"
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                        Reject
                      </ActionBtn>
                    ) : null}
                    {review.status === "APPROVED" ? (
                      <ActionBtn onClick={() => void handleFeatured(review.id)} tone="gold">
                        {review.isFeatured ? (
                          <StarOff className="h-3.5 w-3.5" />
                        ) : (
                          <Star className="h-3.5 w-3.5" />
                        )}
                        {review.isFeatured ? "Unfeature" : "Feature"}
                      </ActionBtn>
                    ) : null}
                    <ActionBtn onClick={() => openReply(review)} tone="neutral">
                      <MessageSquareQuote className="h-3.5 w-3.5" />
                      Reply
                    </ActionBtn>
                    <ActionBtn onClick={() => void handleDelete(review)} tone="red">
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </ActionBtn>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {createOpen ? (
        <CreateReviewDrawer
          form={createForm}
          products={products}
          saving={savingCreate}
          onChange={setCreateForm}
          onClose={() => setCreateOpen(false)}
          onSave={() => void handleCreate()}
        />
      ) : null}

      {replying ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <button
            aria-label="Close"
            className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px]"
            onClick={() => setReplying(null)}
            type="button"
          />
          <div className="relative w-full max-w-lg overflow-hidden rounded-t-3xl border border-neutral-200 bg-white shadow-2xl sm:rounded-3xl">
            <div className="flex items-center justify-between bg-gradient-to-r from-brand-green-50 to-[#F5F0E6] px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-700">
                  Admin reply
                </p>
                <h2 className="mt-1 font-heading text-lg font-bold text-neutral-900">
                  {replying.customerName}
                </h2>
                <p className="text-xs text-neutral-500">{replying.productName}</p>
              </div>
              <button
                aria-label="Close"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-white"
                onClick={() => setReplying(null)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 px-5 py-5">
              <p className="rounded-xl bg-neutral-50 px-3 py-2.5 text-sm text-neutral-600">
                “{replying.comment}”
              </p>
              <textarea
                className="min-h-[120px] w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Thank you for your feedback…"
                value={replyText}
              />
              <div className="flex gap-2">
                <Button
                  className="h-11 flex-1 rounded-xl"
                  onClick={() => setReplying(null)}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  className="h-11 flex-1 rounded-xl bg-gradient-to-r from-brand-green-900 to-brand-green-600 text-white"
                  disabled={savingReply}
                  onClick={() => void saveReply()}
                  type="button"
                >
                  {savingReply ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save reply
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CreateReviewDrawer({
  form,
  products,
  saving,
  onChange,
  onClose,
  onSave,
}: {
  form: CreateReviewInput;
  products: Array<{ id: string; name: string; sku: string }>;
  saving: boolean;
  onChange: (next: CreateReviewInput) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function patch<K extends keyof CreateReviewInput>(key: K, value: CreateReviewInput[K]) {
    onChange({ ...form, [key]: value });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close drawer"
        className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px]"
        onClick={onClose}
        type="button"
      />
      <aside className="relative flex h-full w-full max-w-lg flex-col border-l border-neutral-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-100 bg-gradient-to-r from-brand-green-50 to-[#F5F0E6] px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-700">
              New review
            </p>
            <h2 className="mt-1 font-heading text-xl font-bold text-neutral-900">
              Create customer review
            </h2>
          </div>
          <button
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-white"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Product</span>
            <select
              className={inputClass}
              onChange={(e) => patch("productId", e.target.value)}
              value={form.productId}
            >
              <option value="">Select product…</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-neutral-700">Customer name</span>
              <input
                className={inputClass}
                onChange={(e) => patch("customerName", e.target.value)}
                placeholder="Ayesha Rahman"
                value={form.customerName}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-neutral-700">Email (optional)</span>
              <input
                className={inputClass}
                onChange={(e) => patch("customerEmail", e.target.value)}
                placeholder="customer@email.com"
                type="email"
                value={form.customerEmail ?? ""}
              />
            </label>
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Rating</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => {
                const value = index + 1;
                return (
                  <button
                    key={value}
                    aria-label={`${value} stars`}
                    className="rounded-lg p-1.5 transition hover:bg-amber-50"
                    onClick={() => patch("rating", value)}
                    type="button"
                  >
                    <Star
                      className={cn(
                        "h-6 w-6",
                        value <= form.rating
                          ? "fill-[#C9A24B] text-[#C9A24B]"
                          : "text-neutral-300"
                      )}
                    />
                  </button>
                );
              })}
              <span className="ml-2 text-sm font-semibold text-neutral-700">
                {form.rating}/5
              </span>
            </div>
          </div>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Title (optional)</span>
            <input
              className={inputClass}
              onChange={(e) => patch("title", e.target.value)}
              placeholder="Great daily support"
              value={form.title ?? ""}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Review</span>
            <textarea
              className="min-h-[120px] w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(e) => patch("comment", e.target.value)}
              placeholder="Write the customer feedback…"
              value={form.comment}
            />
          </label>

          <div className="space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Status</span>
            <div className="grid grid-cols-3 gap-2">
              {(["APPROVED", "PENDING", "REJECTED"] as const).map((status) => (
                <button
                  key={status}
                  className={cn(
                    "h-10 rounded-xl border text-xs font-semibold transition",
                    form.status === status
                      ? "border-brand-green-600 bg-brand-green-50 text-brand-green-900"
                      : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                  )}
                  onClick={() =>
                    patch(
                      "status",
                      status
                    )
                  }
                  type="button"
                >
                  {statusMeta[status].label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
            <input
              checked={form.isFeatured && form.status === "APPROVED"}
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-brand-green-600"
              disabled={form.status !== "APPROVED"}
              onChange={(e) => patch("isFeatured", e.target.checked)}
              type="checkbox"
            />
            <span>
              <span className="block text-sm font-semibold text-neutral-900">
                Feature on homepage
              </span>
              <span className="mt-0.5 block text-xs text-neutral-500">
                Only available when status is Approved
              </span>
            </span>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">
              Admin reply (optional)
            </span>
            <textarea
              className="min-h-[88px] w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(e) => patch("adminReply", e.target.value)}
              placeholder="Thank you for your feedback…"
              value={form.adminReply ?? ""}
            />
          </label>
        </div>

        <div className="flex gap-2 border-t border-neutral-100 px-5 py-4">
          <Button
            className="h-11 flex-1 rounded-xl"
            onClick={onClose}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="h-11 flex-1 rounded-xl bg-gradient-to-r from-brand-green-900 to-brand-green-600 text-white hover:from-brand-green-900 hover:to-brand-green-900"
            disabled={
              saving ||
              !form.productId ||
              !form.customerName.trim() ||
              form.comment.trim().length < 8
            }
            onClick={onSave}
            type="button"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create review
          </Button>
        </div>
      </aside>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "gold" | "teal" | "slate";
}) {
  const tones = {
    green: "from-[#E8F5EE] to-white border-brand-green-100",
    gold: "from-[#F5F0E6] to-white border-[#E8D9B0]",
    teal: "from-[#E6F4F0] to-white border-emerald-100",
    slate: "from-neutral-50 to-white border-neutral-200",
  };
  return (
    <div className={cn("rounded-2xl border bg-gradient-to-br p-4 shadow-sm", tones[tone])}>
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone: "green" | "red" | "gold" | "neutral";
}) {
  return (
    <button
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition",
        tone === "green" && "bg-brand-green-50 text-brand-green-800 hover:bg-brand-green-100",
        tone === "red" && "bg-red-50 text-red-700 hover:bg-red-100",
        tone === "gold" && "bg-[#F5F0E6] text-[#8A6E2F] hover:bg-[#efe4c8]",
        tone === "neutral" && "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
