import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CustomerOrderDetail } from "@/components/customer/customer-order-detail";
import { getOrderByNumber } from "@/components/customer/orders-data";

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
  const order = getOrderByNumber(orderNumber);

  if (!order) {
    notFound();
  }

  return <CustomerOrderDetail order={order} />;
}
