import type { ReactNode } from "react";

import { Footer } from "@/components/public/footer";
import { Navbar } from "@/components/public/navbar";
import { TopBar } from "@/components/public/top-bar";

export default function PublicLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(22,135,93,0.08),_transparent_35%),linear-gradient(to_bottom,_#ffffff,_#f7f8f9_55%,_#f7f8f9)]">
      <TopBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}