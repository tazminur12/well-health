import { Suspense } from "react";

import { AdminMessagesPage } from "@/components/admin/admin-messages-page";

export const metadata = {
  title: "Messages | Well Health Admin",
  description: "Contact form inbox and customer messages",
};

export default function AdminMessagesRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[360px] items-center justify-center text-sm text-neutral-500">
          Loading inbox…
        </div>
      }
    >
      <AdminMessagesPage />
    </Suspense>
  );
}
