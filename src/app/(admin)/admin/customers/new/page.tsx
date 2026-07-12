import { CustomerForm } from "@/components/admin/customer-form";

export default function AdminNewCustomerPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-600">
          CRM
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-neutral-900">Add Customer</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manually create a customer account with email login credentials.
        </p>
      </header>

      <CustomerForm mode="create" />
    </div>
  );
}
