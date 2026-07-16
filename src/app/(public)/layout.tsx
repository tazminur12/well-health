import type { ReactNode } from "react";

import { Footer } from "@/components/public/footer";
import { Navbar } from "@/components/public/navbar";
import { TopBar } from "@/components/public/top-bar";
import { WhatsAppChatButton } from "@/components/public/whatsapp-chat-button";
import { WishlistProvider } from "@/components/public/wishlist-provider";
import { getSessionUser } from "@/lib/auth/session";
import { getPublicStoreSettings } from "@/lib/settings/public-queries";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [user, settings] = await Promise.all([
    getSessionUser(),
    getPublicStoreSettings(),
  ]);

  return (
    <WishlistProvider isAuthenticated={Boolean(user)}>
      <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(22,135,93,0.08),_transparent_35%),linear-gradient(to_bottom,_#ffffff,_#f7f8f9_55%,_#f7f8f9)]">
        <TopBar settings={settings} />
        <Navbar
          user={
            user
              ? {
                  name: user.name,
                  email: user.email,
                  role: user.role,
                }
              : null
          }
        />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
        <WhatsAppChatButton whatsapp={settings.whatsapp} />
      </div>
    </WishlistProvider>
  );
}
