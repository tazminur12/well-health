import type { Metadata } from "next";
import { Hind_Siliguri, Inter, Sora } from "next/font/google";

import { Providers } from "@/components/providers";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { BRAND_LOGO, BRAND_NAME } from "@/lib/branding";

import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["latin", "bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
  display: "swap",
});

export const metadata: Metadata = {
  title: BRAND_NAME,
  description: "Premium health supplements — clinical quality, nature-backed.",
  icons: {
    icon: [{ url: BRAND_LOGO.favicon, type: "image/png", sizes: "32x32" }],
    apple: [{ url: BRAND_LOGO.appleTouchIcon, sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable} ${hindSiliguri.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
