import { createHash, randomBytes } from "crypto";

import type { InviteStatus, Role, StaffInvite, StaffRole, User } from "@prisma/client";

import {
  defaultPermissionsForAccessLevel,
  normalizePermissions,
  type AdminPermissionKey,
} from "@/lib/roles/permissions";

export type AdminStaffRole = {
  id: string;
  name: string;
  slug: string;
  description: string;
  accessLevel: "ADMIN" | "SUPPORT" | "CUSTOMER";
  isSystem: boolean;
  permissions: AdminPermissionKey[];
  memberCount: number;
  pendingInvites: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminStaffMember = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "ADMIN" | "SUPPORT";
  status: "Active" | "Suspended";
  staffRole: { id: string; name: string; accessLevel: "ADMIN" | "SUPPORT" | "CUSTOMER" } | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminStaffInvite = {
  id: string;
  email: string;
  name: string;
  status: InviteStatus;
  role: { id: string; name: string; accessLevel: "ADMIN" | "SUPPORT" | "CUSTOMER" };
  invitedByName: string | null;
  expiresAt: string;
  createdAt: string;
  acceptedAt: string | null;
};

export function slugifyRoleName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function createInviteToken() {
  return randomBytes(32).toString("hex");
}

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function mapStaffRole(
  role: StaffRole & { _count?: { users: number; invites: number } }
): AdminStaffRole {
  const accessLevel = role.accessLevel as "ADMIN" | "SUPPORT" | "CUSTOMER";
  const stored = normalizePermissions(role.permissions);
  const permissions =
    stored.length > 0
      ? stored
      : defaultPermissionsForAccessLevel(accessLevel, role.slug);

  return {
    id: role.id,
    name: role.name,
    slug: role.slug,
    description: role.description ?? "",
    accessLevel,
    isSystem: role.isSystem,
    permissions,
    memberCount: role._count?.users ?? 0,
    pendingInvites: role._count?.invites ?? 0,
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt.toISOString(),
  };
}

export function mapStaffMember(
  user: User & { staffRole: StaffRole | null }
): AdminStaffMember {
  return {
    id: user.id,
    name: user.name?.trim() || "Unnamed",
    email: user.email,
    phone: user.phone?.trim() || "—",
    role: user.role as "ADMIN" | "SUPPORT",
    status: user.status === "SUSPENDED" ? "Suspended" : "Active",
    staffRole: user.staffRole
      ? {
          id: user.staffRole.id,
          name: user.staffRole.name,
          accessLevel: user.staffRole.accessLevel as "ADMIN" | "SUPPORT" | "CUSTOMER",
        }
      : null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function mapStaffInvite(
  invite: StaffInvite & {
    role: StaffRole;
    invitedBy: { name: string | null } | null;
  }
): AdminStaffInvite {
  return {
    id: invite.id,
    email: invite.email,
    name: invite.name?.trim() || "",
    status: invite.status,
    role: {
      id: invite.role.id,
      name: invite.role.name,
      accessLevel: invite.role.accessLevel as "ADMIN" | "SUPPORT" | "CUSTOMER",
    },
    invitedByName: invite.invitedBy?.name ?? null,
    expiresAt: invite.expiresAt.toISOString(),
    createdAt: invite.createdAt.toISOString(),
    acceptedAt: invite.acceptedAt?.toISOString() ?? null,
  };
}

export function isStaffAccessRole(role: Role) {
  return role === "ADMIN" || role === "SUPPORT";
}
