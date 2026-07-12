import type { Metadata } from "next";

import { CheckoutSuccessClient } from "@/components/public/checkout-success";

export const metadata: Metadata = {
  title: "Order Confirmed | Well Health",
  description: "Your Well Health order has been placed successfully.",
};

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[70vh] bg-[radial-gradient(circle_at_top,_rgba(22,135,93,0.07),_transparent_40%),linear-gradient(to_bottom,_#ffffff,_#f7f8f9_55%,_#f7f8f9)]">
      <CheckoutSuccessClient />
    </div>
  );
}
