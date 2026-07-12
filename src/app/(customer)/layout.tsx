import type { ReactNode } from "react";

import { CustomerShell } from "@/components/customer/customer-shell";
import { WishlistProvider } from "@/components/public/wishlist-provider";
import { getSessionUser } from "@/lib/auth/session";

export default async function CustomerLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  return (
    <WishlistProvider isAuthenticated={Boolean(user)}>
      <CustomerShell user={user}>{children}</CustomerShell>
    </WishlistProvider>
  );
}
