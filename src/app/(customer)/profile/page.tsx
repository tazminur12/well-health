import type { Metadata } from "next";

import { CustomerProfile } from "@/components/customer/customer-profile";

export const metadata: Metadata = {
  title: "My Profile | Well Health",
  description: "Manage your Well Health account information",
};

export default function CustomerProfilePage() {
  return <CustomerProfile />;
}
