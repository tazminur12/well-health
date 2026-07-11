import type { Metadata } from "next";

import { CustomerDashboardOverview } from "@/components/customer/customer-dashboard-overview";

export const metadata: Metadata = {
  title: "Dashboard | Well Health",
  description: "Your Well Health account overview",
};

export default function CustomerDashboardPage() {
  return <CustomerDashboardOverview />;
}
