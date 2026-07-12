"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { CustomerForm } from "@/components/admin/customer-form";
import { useAdminCustomer } from "@/hooks/use-admin-customers";

export default function AdminEditCustomerPage() {
  const params = useParams<{ id: string }>();
  const { data: customer, isLoading, isError, error } = useAdminCustomer(params.id);

  if (isLoading) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
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
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-600">
          CRM
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-neutral-900">Edit Customer</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Update profile details, VIP status, notes, and account status for {customer.name}.
        </p>
      </header>

      <CustomerForm customer={customer} mode="edit" />
    </div>
  );
}
