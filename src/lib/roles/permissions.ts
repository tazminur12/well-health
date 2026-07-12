/** Admin module permissions that can be granted per staff role. */
export const ADMIN_PERMISSIONS = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "View overview analytics and summary cards",
    href: "/admin/dashboard",
  },
  {
    key: "reports",
    label: "Reports",
    description: "View sales reports, charts, and business analytics",
    href: "/admin/reports",
  },
  {
    key: "messages",
    label: "Messages",
    description: "Contact form inbox and customer inquiries",
    href: "/admin/messages",
  },
  {
    key: "products",
    label: "Products",
    description: "View, create, and edit catalog products",
    href: "/admin/products",
  },
  {
    key: "categories",
    label: "Categories",
    description: "Organize product categories and shop filters",
    href: "/admin/categories",
  },
  {
    key: "inventory",
    label: "Inventory",
    description: "Track stock levels and low-stock alerts",
    href: "/admin/inventory",
  },
  {
    key: "reviews",
    label: "Reviews",
    description: "Moderate product reviews and ratings",
    href: "/admin/reviews",
  },
  {
    key: "orders",
    label: "Orders",
    description: "View and manage customer orders",
    href: "/admin/orders",
  },
  {
    key: "customers",
    label: "Customers",
    description: "View and manage customer accounts",
    href: "/admin/customers",
  },
  {
    key: "coupons",
    label: "Coupons",
    description: "Create and manage discount codes",
    href: "/admin/coupons",
  },
  {
    key: "shipping",
    label: "Shipping",
    description: "Delivery zones, fees, and courier partners",
    href: "/admin/shipping",
  },
  {
    key: "marketing",
    label: "Marketing",
    description: "Email and SMS marketing campaigns",
    href: "/admin/marketing",
  },
  {
    key: "roles",
    label: "Role Management",
    description: "Create roles, invite staff, and set access",
    href: "/admin/roles",
  },
  {
    key: "blog",
    label: "Blog",
    description: "Manage blog posts and publishing",
    href: "/admin/blog",
  },
  {
    key: "content",
    label: "Content",
    description: "Edit marketing and page content",
    href: "/admin/content",
  },
  {
    key: "settings",
    label: "Settings",
    description: "Store and system configuration",
    href: "/admin/settings",
  },
] as const;

export type AdminPermissionKey = (typeof ADMIN_PERMISSIONS)[number]["key"];

export const ALL_ADMIN_PERMISSION_KEYS: AdminPermissionKey[] = ADMIN_PERMISSIONS.map(
  (item) => item.key
);

export function defaultPermissionsForAccessLevel(
  accessLevel: "ADMIN" | "SUPPORT" | "CUSTOMER",
  slug?: string
): AdminPermissionKey[] {
  if (accessLevel === "CUSTOMER") return [];
  if (slug === "super-admin" || accessLevel === "ADMIN") {
    return [...ALL_ADMIN_PERMISSION_KEYS];
  }
  // Support defaults
  return ["dashboard", "orders", "customers", "messages"];
}

export function normalizePermissions(values: string[] | null | undefined): AdminPermissionKey[] {
  if (!values?.length) return [];
  const allowed = new Set<string>(ALL_ADMIN_PERMISSION_KEYS);
  return values.filter((value): value is AdminPermissionKey => allowed.has(value));
}
