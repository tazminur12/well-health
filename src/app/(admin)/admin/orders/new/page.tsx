import { AdminOrderForm } from "@/components/admin/admin-order-form";

export default function AdminNewOrderPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-600">
          Sales
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-neutral-900">
          Add Order
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Create a manual order for phone, WhatsApp, or walk-in customers.
        </p>
      </header>

      <AdminOrderForm />
    </div>
  );
}
