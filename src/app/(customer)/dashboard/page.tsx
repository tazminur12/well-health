import type { Metadata } from "next";

import { CustomerDashboardOverview } from "@/components/customer/customer-dashboard-overview";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Dashboard | Well Health",
  description: "Your Well Health account overview",
};

export default async function CustomerDashboardPage() {
  const user = await getSessionUser();

  return <CustomerDashboardOverview customerName={user?.name ?? user?.email} />;
}
