import type { Metadata } from "next";

import { AboutPageContent } from "@/components/public/about-page";

export const metadata: Metadata = {
  title: "About Us | Well Health Trade International",
  description:
    "Discover Well Health Trade International — a clinical premium supplement brand built on science, integrity, and care for Bangladesh families.",
};

export default function AboutPage() {
  return <AboutPageContent />;
}
