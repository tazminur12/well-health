import type { Metadata } from "next";

import { CustomerOrdersList } from "@/components/customer/customer-orders-list";

export const metadata: Metadata = {
  title: "My Orders | Well Health",
  description: "Track and manage your Well Health orders",
};

export default function CustomerOrdersPage() {
  return <CustomerOrdersList />;
}
