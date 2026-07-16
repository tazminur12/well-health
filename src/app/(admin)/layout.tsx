import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { resolveAdminPermissions } from "@/lib/admin/permissions";
import { getSessionUser } from "@/lib/auth/session";
import { Role } from "@prisma/client";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  const permissions =
    user?.role === Role.ADMIN ? (await resolveAdminPermissions(user.id)).permissions : [];

  return (
    <AdminShell permissions={permissions} user={user}>
      {children}
    </AdminShell>
  );
}
