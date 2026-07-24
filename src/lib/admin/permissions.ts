import type { StaffRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  ALL_ADMIN_PERMISSION_KEYS,
  defaultPermissionsForAccessLevel,
  normalizePermissions,
  type AdminPermissionKey,
} from "@/lib/roles/permissions";

export type ResolvedAdminPermissions = {
  permissions: AdminPermissionKey[];
  staffRoleSlug: string | null;
  isSuperAdmin: boolean;
};

function permissionsFromStaffRole(role: StaffRole): AdminPermissionKey[] {
  if (role.slug === "super-admin") {
    return [...ALL_ADMIN_PERMISSION_KEYS];
  }

  const stored = normalizePermissions(role.permissions);
  if (stored.length > 0) {
    return stored;
  }

  return defaultPermissionsForAccessLevel(
    role.accessLevel as "ADMIN" | "SUPPORT" | "CUSTOMER",
    role.slug
  );
}

/** Resolve effective module permissions for an admin user. */
export async function resolveAdminPermissions(
  userId: string
): Promise<ResolvedAdminPermissions> {
  const profile = await prisma.user.findUnique({
    where: { id: userId },
    include: { staffRole: true },
  });

  if (!profile?.staffRole) {
    // Legacy admins without an assigned staff role keep full access.
    return {
      permissions: [...ALL_ADMIN_PERMISSION_KEYS],
      staffRoleSlug: null,
      isSuperAdmin: true,
    };
  }

  const permissions = permissionsFromStaffRole(profile.staffRole);

  return {
    permissions,
    staffRoleSlug: profile.staffRole.slug,
    isSuperAdmin: profile.staffRole.slug === "super-admin",
  };
}

export function adminHasPermission(
  resolved: ResolvedAdminPermissions,
  permission: AdminPermissionKey
) {
  if (resolved.isSuperAdmin) return true;
  return resolved.permissions.includes(permission);
}
