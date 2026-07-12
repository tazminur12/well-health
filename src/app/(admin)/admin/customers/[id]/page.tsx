"use client";

import {
  ArrowLeft,
  Loader2,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  ShieldBan,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTransition } from "react";

import {
  customerAvatarTone,
  customerInitials,
  customerStatusPillClass,
  customerTagPillClass,
  formatCustomerDate,
  formatCustomerPrice,
} from "@/components/admin/customers-data";
import { Button } from "@/components/ui/button";
import { useAdminCustomer, useCustomerMutations } from "@/hooks/use-admin-customers";
import { confirmAdminAction, showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import { cn } from "@/lib/utils";

export default function AdminCustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { data: customer, isLoading, isError, error } = useAdminCustomer(id);
  const { setStatus, deleteCustomer } = useCustomerMutations();
  const [isPending, startTransition] = useTransition();

  async function handleToggleStatus() {
    if (!customer) return;
    const next = customer.status === "Active" ? "Suspended" : "Active";
    const confirmed = await confirmAdminAction({
      title: next === "Suspended" ? "Suspend customer?" : "Reactivate customer?",
      text:
        next === "Suspended"
          ? "They will be blocked from signing in until reactivated."
          : "They will be able to sign in again.",
      confirmText: next === "Suspended" ? "Suspend" : "Reactivate",
    });
    if (!confirmed) return;

    startTransition(async () => {
      try {
        await setStatus.mutateAsync({ id: customer.id, status: next });
        await showAdminSuccess(
          next === "Suspended" ? "Customer suspended" : "Customer reactivated",
          "Account status updated."
        );
        router.refresh();
      } catch (err) {
        await showAdminError(
          "Status update failed",
          err instanceof Error ? err.message : "Please try again."
        );
      }
    });
  }

  async function handleDelete() {
    if (!customer) return;
    const confirmed = await confirmAdminAction({
      title: "Delete customer?",
      text: "This removes their profile and auth account. This cannot be undone.",
      confirmText: "Delete",
    });
    if (!confirmed) return;

    startTransition(async () => {
      try {
        await deleteCustomer.mutateAsync(customer.id);
        await showAdminSuccess("Customer deleted", "The account has been removed.");
        router.push("/admin/customers");
        router.refresh();
      } catch (err) {
        await showAdminError(
          "Delete failed",
          err instanceof Error ? err.message : "Please try again."
        );
      }
    });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <Loader2 className="h-6 w-6 animate-spin text-brand-green-600" />
        Loading customer…
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h2 className="font-heading text-xl font-bold text-neutral-900">Customer not found</h2>
        <p className="mt-2 text-sm text-neutral-500">
          {error instanceof Error ? error.message : "This customer may have been deleted."}
        </p>
        <Link
          className="mt-5 inline-flex text-sm font-semibold text-brand-green-600 hover:underline"
          href="/admin/customers"
        >
          Back to customers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-brand-green-600"
          href="/admin/customers"
        >
          <ArrowLeft className="h-4 w-4" />
          All customers
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="h-10 rounded-xl" variant="outline">
            <Link href={`/admin/customers/${customer.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button
            className={cn(
              "h-10 rounded-xl",
              customer.status === "Active"
                ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                : "border-brand-green-200 text-brand-green-700 hover:bg-brand-green-100"
            )}
            disabled={isPending}
            onClick={() => void handleToggleStatus()}
            type="button"
            variant="outline"
          >
            {customer.status === "Active" ? (
              <ShieldBan className="h-4 w-4" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            {customer.status === "Active" ? "Suspend" : "Reactivate"}
          </Button>
          <Button
            className="h-10 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
            disabled={isPending}
            onClick={() => void handleDelete()}
            type="button"
            variant="outline"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-100 bg-[radial-gradient(circle_at_top_right,rgba(22,135,93,0.12),transparent_40%),linear-gradient(135deg,#f8fbf9,#ffffff)] px-5 py-6 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span
                className={cn(
                  "inline-flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold shadow-sm",
                  customerAvatarTone(customer.name)
                )}
              >
                {customerInitials(customer.name)}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-heading text-2xl font-bold text-neutral-900">
                    {customer.name}
                  </h1>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                      customerStatusPillClass(customer.status)
                    )}
                  >
                    {customer.status}
                  </span>
                  {customer.tag ? (
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                        customerTagPillClass(customer.tag)
                      )}
                    >
                      {customer.tag}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  Joined {formatCustomerDate(customer.joinedAt)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 text-sm font-medium text-neutral-700 transition-colors hover:border-brand-green-600 hover:text-brand-green-700"
                href={`mailto:${customer.email}`}
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
              {customer.phone !== "—" ? (
                <a
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 text-sm font-medium text-neutral-700 transition-colors hover:border-brand-green-600 hover:text-brand-green-700"
                  href={`tel:${customer.phone}`}
                >
                  <Phone className="h-4 w-4" />
                  Call
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-neutral-100 sm:grid-cols-3">
          {[
            { label: "Total orders", value: String(customer.totalOrders) },
            { label: "Lifetime spent", value: formatCustomerPrice(customer.totalSpent) },
            {
              label: "Avg. order value",
              value: formatCustomerPrice(
                customer.totalOrders ? customer.totalSpent / customer.totalOrders : 0
              ),
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-white px-5 py-4 sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {stat.label}
              </p>
              <p className="mt-1 font-heading text-xl font-bold text-neutral-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-heading text-lg font-bold text-neutral-900">Contact</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex items-start gap-3 rounded-xl bg-neutral-50 px-4 py-3">
              <Mail className="mt-0.5 h-4 w-4 text-brand-green-600" />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Email
                </dt>
                <dd className="mt-0.5 font-medium text-neutral-900">{customer.email}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-neutral-50 px-4 py-3">
              <Phone className="mt-0.5 h-4 w-4 text-brand-green-600" />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Phone
                </dt>
                <dd className="mt-0.5 font-medium text-neutral-900">{customer.phone}</dd>
              </div>
            </div>
          </dl>

          <div className="border-t border-neutral-100 pt-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-neutral-900">
              Internal notes
            </h3>
            <p className="mt-3 whitespace-pre-line rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-600">
              {customer.notes.trim() || "No notes yet. Add notes from the edit page."}
            </p>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-bold text-neutral-900">Addresses</h2>
            <MapPin className="h-4 w-4 text-neutral-400" />
          </div>
          {customer.addresses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center">
              <p className="text-sm font-medium text-neutral-700">No saved addresses</p>
              <p className="mt-1 text-xs text-neutral-500">
                Addresses will appear after the Address model is connected.
              </p>
            </div>
          ) : null}
        </section>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-bold text-neutral-900">Order history</h2>
          <Package className="h-4 w-4 text-neutral-400" />
        </div>
        {customer.orderHistory.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-12 text-center">
            <p className="text-sm font-medium text-neutral-700">No orders yet</p>
            <p className="mt-1 text-sm text-neutral-500">
              Order history will populate when checkout and the Orders backend are live.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
