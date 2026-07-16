import { Suspense } from "react";

import { AdminDistributorsPage } from "@/components/admin/admin-distributors-page";

export const metadata = {
  title: "Distributors | Well Health Admin",
  description: "Review and manage distributor partnership applications",
};

export default function AdminDistributorsRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[360px] items-center justify-center text-sm text-neutral-500">
          Loading distributor applications…
        </div>
      }
    >
      <AdminDistributorsPage />
    </Suspense>
  );
}
