"use client";

import { Role } from "@prisma/client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { BottomTabBar } from "@/components/customer/bottom-tab-bar";
import {
  CustomerDesktopTopbar,
  CustomerMobileHeader,
  type CustomerShellUser,
} from "@/components/customer/customer-header";
import { CustomerSidebar } from "@/components/customer/customer-sidebar";
import { MobileNavDrawer } from "@/components/customer/mobile-nav-drawer";
import { useCustomerProfile } from "@/hooks/use-customer-profile";

export function CustomerShell({
  children,
  user = null,
}: {
  children: React.ReactNode;
  user?: CustomerShellUser | null;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: liveProfile } = useCustomerProfile();

  const activeUser: CustomerShellUser | null = liveProfile
    ? {
        id: liveProfile.id,
        email: liveProfile.email,
        name: liveProfile.name,
        avatarUrl: liveProfile.avatarUrl,
        phone: liveProfile.phone,
        role: user?.role ?? Role.CUSTOMER,
      }
    : user;

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <CustomerSidebar pathname={pathname} user={activeUser} />

      <div className="md:ml-60">
        <CustomerMobileHeader
          onOpenMenu={() => setDrawerOpen(true)}
          pathname={pathname}
          user={activeUser}
        />
        <CustomerDesktopTopbar pathname={pathname} user={activeUser} />

        <main className="px-4 py-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:px-6 md:py-6 md:pb-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>

      <BottomTabBar pathname={pathname} />
      <MobileNavDrawer
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        pathname={pathname}
        user={activeUser}
      />
    </div>
  );
}
