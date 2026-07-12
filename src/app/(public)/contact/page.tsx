import type { Metadata } from "next";

import { ContactPageContent } from "@/components/public/contact-page";

export const metadata: Metadata = {
  title: "Contact Us | Well Health Trade International",
  description:
    "Contact Well Health Trade International for product questions, order support, and partnership enquiries across Bangladesh.",
};

export default function ContactPage() {
  return <ContactPageContent />;
}
