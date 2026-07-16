import { Role } from "@prisma/client";

import type { AuthUser } from "@/lib/auth/session";
import { getSessionUser } from "@/lib/auth/session";
import type { AdminPermissionKey } from "@/lib/roles/permissions";

import {
  adminHasPermission,
  resolveAdminPermissions,
  type ResolvedAdminPermissions,
} from "./permissions";

export class AdminAuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AdminAuthError";
  }
}

export type AdminUser = AuthUser & ResolvedAdminPermissions;

async function loadAdminUser(): Promise<AdminUser | null> {
  const user = await getSessionUser();
  if (!user) return null;
  if (user.role !== Role.ADMIN) return null;

  const resolved = await resolveAdminPermissions(user.id);
  return { ...user, ...resolved };
}

/** Server-side admin gate — never trust client role checks alone. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await loadAdminUser();
  if (!admin) {
    throw new AdminAuthError("Admin access required.");
  }
  return admin;
}

/** Require admin access plus a specific module permission. */
export async function requireAdminPermission(
  permission: AdminPermissionKey
): Promise<AdminUser> {
  const admin = await requireAdmin();

  if (!adminHasPermission(admin, permission)) {
    throw new AdminAuthError("You do not have permission to perform this action.");
  }

  return admin;
}
