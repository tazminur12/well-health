import type { Metadata } from "next";
import { Hind_Siliguri, Inter, Sora } from "next/font/google";

import { Providers } from "@/components/providers";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { getPublicSiteAssets } from "@/lib/content/public-queries";
import { buildRootMetadata } from "@/lib/seo/root-metadata";
import { buildSiteStructuredData } from "@/lib/seo/site-structured-data";
import { getPublicStoreSettings } from "@/lib/settings/public-queries";

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

export async function generateMetadata(): Promise<Metadata> {
  const [settings, assets] = await Promise.all([
    getPublicStoreSettings(),
    getPublicSiteAssets(),
  ]);

  return buildRootMetadata({
    settings,
    ogImage: assets.ogImageUrl,
  });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, assets] = await Promise.all([
    getPublicStoreSettings(),
    getPublicSiteAssets(),
  ]);

  const structuredData = buildSiteStructuredData({
    settings,
    ogImage: assets.ogImageUrl,
  });

  return (
    <html
      lang="en-BD"
      className={`${sora.variable} ${inter.variable} ${hindSiliguri.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          type="application/ld+json"
        />
        <Providers>
          {children}
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
