import type { Metadata } from "next";

import { CustomerOrderDetail } from "@/components/customer/customer-order-detail";

type OrderDetailPageProps = {
  params: Promise<{
    orderNumber: string;
  }>;
};

export async function generateMetadata({ params }: OrderDetailPageProps): Promise<Metadata> {
  const { orderNumber } = await params;

  return {
    title: `Order ${orderNumber} | Well Health`,
    description: "View your order details, status, and tracking.",
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderNumber } = await params;
  return <CustomerOrderDetail orderNumber={decodeURIComponent(orderNumber)} />;
}
