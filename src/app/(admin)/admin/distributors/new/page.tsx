import { AdminDistributorForm } from "@/components/admin/admin-distributor-form";

export const metadata = {
  title: "Add Distributor | Well Health Admin",
  description: "Manually add a distributor or partnership record",
};

export default function AdminNewDistributorPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-600">
          Partnerships
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-neutral-900">Add Distributor</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manually register a distributor from phone, walk-in, or referral — without a public
          application form.
        </p>
      </header>

      <AdminDistributorForm />
    </div>
  );
}
