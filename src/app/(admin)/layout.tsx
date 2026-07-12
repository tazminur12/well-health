import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { getSessionUser } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  return <AdminShell user={user}>{children}</AdminShell>;
}
