import "@fontsource/hind-siliguri/bengali-400.css";
import "@fontsource/hind-siliguri/bengali-500.css";
import "@fontsource/hind-siliguri/bengali-600.css";
import "@fontsource/hind-siliguri/bengali-700.css";
import "@fontsource/hind-siliguri/latin-400.css";
import "@fontsource/hind-siliguri/latin-500.css";
import "@fontsource/hind-siliguri/latin-600.css";
import "@fontsource/hind-siliguri/latin-700.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/sora/latin-500.css";
import "@fontsource/sora/latin-600.css";
import "@fontsource/sora/latin-700.css";
import type { Metadata } from "next";

import { Providers } from "@/components/providers";
// import { ChatWidget } from "@/components/chat/ChatWidget";
import { getPublicSiteAssets } from "@/lib/content/public-queries";
import { buildRootMetadata } from "@/lib/seo/root-metadata";
import { buildSiteStructuredData } from "@/lib/seo/site-structured-data";
import { getPublicStoreSettings } from "@/lib/settings/public-queries";

import "./globals.css";

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
      className="h-full"
    >
      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          type="application/ld+json"
        />
        <Providers>
          {children}
          {/* ChatWidget disabled temporarily — avoids DB calls while Hostinger env is fixed */}
          {/* <ChatWidget /> */}
        </Providers>
      </body>
    </html>
  );
}
