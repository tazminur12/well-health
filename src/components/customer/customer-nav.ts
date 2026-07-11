import {
  Heart,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  ShoppingBag,
  User,
  type LucideIcon,
} from "lucide-react";

export type CustomerNavItem = {
  href: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  unreadCount?: number;
};

export const customerNavItems: CustomerNavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    shortLabel: "Home",
    icon: LayoutDashboard,
  },
  {
    href: "/orders",
    label: "My Orders",
    shortLabel: "Orders",
    icon: ShoppingBag,
  },
  {
    href: "/wishlist",
    label: "Wishlist",
    shortLabel: "Wishlist",
    icon: Heart,
  },
  {
    href: "/messages",
    label: "Messages",
    shortLabel: "Chat",
    icon: MessageCircle,
    unreadCount: 2,
  },
  {
    href: "/profile",
    label: "Profile",
    shortLabel: "Profile",
    icon: User,
  },
];

export const customerLogoutItem: CustomerNavItem = {
  href: "/login",
  label: "Logout",
  icon: LogOut,
};

export const dummyCustomer = {
  name: "Ayesha Rahman",
  email: "ayesha.rahman@email.com",
  initials: "AR",
};

export function getCustomerPageTitle(pathname: string | null): string {
  if (!pathname) return "Dashboard";
  if (pathname.startsWith("/orders")) return "My Orders";
  if (pathname.startsWith("/wishlist")) return "Wishlist";
  if (pathname.startsWith("/messages")) return "Messages";
  if (pathname.startsWith("/profile")) return "Profile";
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  return "Account";
}

export function isCustomerNavActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}
