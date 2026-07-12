"use server";

import { InviteStatus, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { AdminAuthError, requireAdmin } from "@/lib/admin/require-admin";
import { getAppUrl, sendStaffInviteEmail } from "@/lib/email/resend";
import { prisma } from "@/lib/prisma";
import {
  createInviteToken,
  hashInviteToken,
  mapStaffInvite,
  mapStaffMember,
  mapStaffRole,
  slugifyRoleName,
  type AdminStaffInvite,
  type AdminStaffMember,
  type AdminStaffRole,
} from "@/lib/roles/mapper";
import {
  defaultPermissionsForAccessLevel,
  normalizePermissions,
  type AdminPermissionKey,
} from "@/lib/roles/permissions";
import {
  acceptInviteSchema,
  createStaffAccountSchema,
  createStaffRoleSchema,
  inviteStaffSchema,
  updateStaffRolePermissionsSchema,
  updateStaffRoleSchema,
  type AcceptInviteInput,
  type CreateStaffAccountInput,
  type CreateStaffRoleInput,
  type InviteStaffInput,
  type UpdateStaffRoleInput,
  type UpdateStaffRolePermissionsInput,
} from "@/lib/roles/schemas";
import { createAdminClient } from "@/lib/supabase/admin";

type ActionResult<T = undefined> = {
  error?: string;
  data?: T;
  previewUrl?: string;
};

function authErrorResult<T = undefined>(error: unknown): ActionResult<T> | null {
  if (
    error instanceof AdminAuthError ||
    (error instanceof Error && error.name === "AdminAuthError")
  ) {
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }
  return null;
}

async function ensureDefaultRoles() {
  const defaults = [
    {
      name: "Super Admin",
      slug: "super-admin",
      description: "Highest-level access — full admin panel, roles, and security settings.",
      accessLevel: Role.ADMIN,
      isSystem: true,
    },
    {
      name: "Admin",
      slug: "admin",
      description: "Full access to the admin panel, catalog, customers, and settings.",
      accessLevel: Role.ADMIN,
      isSystem: true,
    },
    {
      name: "Support",
      slug: "support",
      description: "Support team access for chat and customer assistance.",
      accessLevel: Role.SUPPORT,
      isSystem: true,
    },
    {
      name: "Customer",
      slug: "customer",
      description: "Storefront shoppers. Managed from Customers — not staff accounts.",
      accessLevel: Role.CUSTOMER,
      isSystem: true,
    },
  ] as const;

  for (const role of defaults) {
    const permissions = defaultPermissionsForAccessLevel(
      role.accessLevel as "ADMIN" | "SUPPORT" | "CUSTOMER",
      role.slug
    );
    await prisma.staffRole.upsert({
      where: { slug: role.slug },
      create: { ...role, permissions },
      update: {
        name: role.name,
        description: role.description,
        accessLevel: role.accessLevel,
        isSystem: true,
        // Keep existing custom permissions if already set; seed only when empty
      },
    });

    const existing = await prisma.staffRole.findUnique({ where: { slug: role.slug } });
    if (existing && existing.permissions.length === 0) {
      await prisma.staffRole.update({
        where: { id: existing.id },
        data: { permissions },
      });
    }
  }

  const superAdminRole = await prisma.staffRole.findUnique({ where: { slug: "super-admin" } });
  const adminRole = await prisma.staffRole.findUnique({ where: { slug: "admin" } });
  const supportRole = await prisma.staffRole.findUnique({ where: { slug: "support" } });
  const customerRole = await prisma.staffRole.findUnique({ where: { slug: "customer" } });

  // Prefer Super Admin for existing ADMIN users that have no staff role yet
  if (superAdminRole) {
    await prisma.user.updateMany({
      where: { role: Role.ADMIN, staffRoleId: null },
      data: { staffRoleId: superAdminRole.id },
    });
  } else if (adminRole) {
    await prisma.user.updateMany({
      where: { role: Role.ADMIN, staffRoleId: null },
      data: { staffRoleId: adminRole.id },
    });
  }
  if (supportRole) {
    await prisma.user.updateMany({
      where: { role: Role.SUPPORT, staffRoleId: null },
      data: { staffRoleId: supportRole.id },
    });
  }
  if (customerRole) {
    await prisma.user.updateMany({
      where: { role: Role.CUSTOMER, staffRoleId: null },
      data: { staffRoleId: customerRole.id },
    });
  }
}

export async function listStaffRolesAction(): Promise<ActionResult<AdminStaffRole[]>> {
  try {
    await requireAdmin();
    await ensureDefaultRoles();

    const [roles, adminCount, supportCount, customerCount] = await Promise.all([
      prisma.staffRole.findMany({
        include: {
          invites: {
            where: { status: InviteStatus.PENDING },
            select: { id: true },
          },
        },
        orderBy: [{ isSystem: "desc" }, { name: "asc" }],
      }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
      prisma.user.count({ where: { role: Role.SUPPORT } }),
      prisma.user.count({ where: { role: Role.CUSTOMER } }),
    ]);

    const counts: Record<string, number> = {
      ADMIN: adminCount,
      SUPPORT: supportCount,
      CUSTOMER: customerCount,
    };

    const order = ["super-admin", "admin", "support", "customer"];
    const sorted = [...roles].sort((a, b) => {
      const ai = order.indexOf(a.slug);
      const bi = order.indexOf(b.slug);
      if (ai !== -1 || bi !== -1) {
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      }
      return a.name.localeCompare(b.name);
    });

    return {
      data: sorted.map((role) =>
        mapStaffRole({
          ...role,
          _count: {
            users: counts[role.accessLevel] ?? 0,
            invites: role.invites.length,
          },
        })
      ),
    };
  } catch (error) {
    const auth = authErrorResult<AdminStaffRole[]>(error);
    if (auth) return auth;
    console.error("listStaffRolesAction:", error);
    return { error: "Could not load roles. Restart the dev server if models were just added." };
  }
}

export async function createStaffRoleAction(
  input: CreateStaffRoleInput
): Promise<ActionResult<AdminStaffRole>> {
  try {
    await requireAdmin();
    const parsed = createStaffRoleSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid role details." };
    }

    const slug = slugifyRoleName(parsed.data.name);
    const existing = await prisma.staffRole.findFirst({
      where: { OR: [{ slug }, { name: parsed.data.name.trim() }] },
    });
    if (existing) return { error: "A role with this name already exists." };

    const role = await prisma.staffRole.create({
      data: {
        name: parsed.data.name.trim(),
        slug,
        description: parsed.data.description?.trim() || null,
        accessLevel: parsed.data.accessLevel as Role,
        isSystem: false,
        permissions: defaultPermissionsForAccessLevel(
          parsed.data.accessLevel as "ADMIN" | "SUPPORT"
        ),
      },
    });

    revalidatePath("/admin/roles");
    return {
      data: mapStaffRole({
        ...role,
        _count: { users: 0, invites: 0 },
      }),
    };
  } catch (error) {
    const auth = authErrorResult<AdminStaffRole>(error);
    if (auth) return auth;
    console.error("createStaffRoleAction:", error);
    return { error: "Failed to create role." };
  }
}

export async function updateStaffRoleAction(
  id: string,
  input: UpdateStaffRoleInput
): Promise<ActionResult<AdminStaffRole>> {
  try {
    await requireAdmin();
    const parsed = updateStaffRoleSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid role details." };
    }

    const existing = await prisma.staffRole.findUnique({ where: { id } });
    if (!existing) return { error: "Role not found." };
    if (existing.isSystem) {
      return { error: "System roles cannot be renamed. Create a custom role instead." };
    }

    const slug = slugifyRoleName(parsed.data.name);
    const conflict = await prisma.staffRole.findFirst({
      where: {
        id: { not: id },
        OR: [{ slug }, { name: parsed.data.name.trim() }],
      },
    });
    if (conflict) return { error: "A role with this name already exists." };

    const role = await prisma.staffRole.update({
      where: { id },
      data: {
        name: parsed.data.name.trim(),
        slug,
        description: parsed.data.description?.trim() || null,
        accessLevel: parsed.data.accessLevel as Role,
      },
      include: {
        _count: { select: { users: true } },
        invites: {
          where: { status: InviteStatus.PENDING },
          select: { id: true },
        },
      },
    });

    revalidatePath("/admin/roles");
    return {
      data: mapStaffRole({
        ...role,
        _count: { users: role._count.users, invites: role.invites.length },
      }),
    };
  } catch (error) {
    const auth = authErrorResult<AdminStaffRole>(error);
    if (auth) return auth;
    console.error("updateStaffRoleAction:", error);
    return { error: "Failed to update role." };
  }
}

export async function deleteStaffRoleAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const existing = await prisma.staffRole.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!existing) return { error: "Role not found." };
    if (existing.isSystem) return { error: "System roles cannot be deleted." };
    if (existing._count.users > 0) {
      return { error: "Remove or reassign members before deleting this role." };
    }

    await prisma.staffInvite.deleteMany({ where: { roleId: id } });
    await prisma.staffRole.delete({ where: { id } });
    revalidatePath("/admin/roles");
    return {};
  } catch (error) {
    const auth = authErrorResult(error);
    if (auth) return auth;
    console.error("deleteStaffRoleAction:", error);
    return { error: "Failed to delete role." };
  }
}

export async function getStaffRoleAction(
  id: string
): Promise<ActionResult<AdminStaffRole>> {
  try {
    await requireAdmin();
    await ensureDefaultRoles();

    const role = await prisma.staffRole.findUnique({
      where: { id },
      include: {
        invites: {
          where: { status: InviteStatus.PENDING },
          select: { id: true },
        },
      },
    });
    if (!role) return { error: "Role not found." };

    const memberCount = await prisma.user.count({
      where: { role: role.accessLevel },
    });

    return {
      data: mapStaffRole({
        ...role,
        _count: { users: memberCount, invites: role.invites.length },
      }),
    };
  } catch (error) {
    const auth = authErrorResult<AdminStaffRole>(error);
    if (auth) return auth;
    console.error("getStaffRoleAction:", error);
    return { error: "Could not load role." };
  }
}

export async function updateStaffRolePermissionsAction(
  id: string,
  input: UpdateStaffRolePermissionsInput
): Promise<ActionResult<AdminStaffRole>> {
  try {
    await requireAdmin();
    const parsed = updateStaffRolePermissionsSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid permissions." };
    }

    const existing = await prisma.staffRole.findUnique({ where: { id } });
    if (!existing) return { error: "Role not found." };
    if (existing.accessLevel === Role.CUSTOMER) {
      return { error: "Customer role does not use admin panel permissions." };
    }
    if (existing.slug === "super-admin") {
      return { error: "Super Admin always has full access and cannot be restricted." };
    }

    const permissions = normalizePermissions(parsed.data.permissions);
    const role = await prisma.staffRole.update({
      where: { id },
      data: {
        permissions,
        description:
          parsed.data.description !== undefined
            ? parsed.data.description.trim() || null
            : undefined,
        name: parsed.data.name?.trim() || undefined,
      },
      include: {
        invites: {
          where: { status: InviteStatus.PENDING },
          select: { id: true },
        },
      },
    });

    const memberCount = await prisma.user.count({
      where: { role: role.accessLevel },
    });

    revalidatePath("/admin/roles");
    revalidatePath(`/admin/roles/${id}`);
    return {
      data: mapStaffRole({
        ...role,
        _count: { users: memberCount, invites: role.invites.length },
      }),
    };
  } catch (error) {
    const auth = authErrorResult<AdminStaffRole>(error);
    if (auth) return auth;
    console.error("updateStaffRolePermissionsAction:", error);
    return { error: "Failed to update permissions." };
  }
}

export async function listStaffMembersAction(): Promise<ActionResult<AdminStaffMember[]>> {
  try {
    await requireAdmin();
    const users = await prisma.user.findMany({
      where: { role: { in: [Role.ADMIN, Role.SUPPORT] } },
      include: { staffRole: true },
      orderBy: { createdAt: "desc" },
    });
    return { data: users.map(mapStaffMember) };
  } catch (error) {
    const auth = authErrorResult<AdminStaffMember[]>(error);
    if (auth) return auth;
    console.error("listStaffMembersAction:", error);
    return { error: "Could not load team members." };
  }
}

export async function createStaffAccountAction(
  input: CreateStaffAccountInput
): Promise<ActionResult<AdminStaffMember>> {
  try {
    await requireAdmin();
    const parsed = createStaffAccountSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid account details." };
    }

    const staffRole = await prisma.staffRole.findUnique({
      where: { id: parsed.data.roleId },
    });
    if (!staffRole) return { error: "Selected role was not found." };
    if (staffRole.accessLevel === Role.CUSTOMER) {
      return { error: "Customer role cannot be used for staff accounts." };
    }

    const email = parsed.data.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { error: "A user with this email already exists." };

    let authUserId: string;
    try {
      const admin = createAdminClient();
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password: parsed.data.password,
        email_confirm: true,
        user_metadata: {
          full_name: parsed.data.name,
          phone: parsed.data.phone ?? null,
          role: staffRole.accessLevel,
          staff_role_id: staffRole.id,
        },
      });
      if (error || !data.user) {
        return { error: error?.message ?? "Failed to create auth account." };
      }
      authUserId = data.user.id;
    } catch (error) {
      console.error("createStaffAccount auth failed:", error);
      return { error: "Could not create staff login. Check Supabase service role key." };
    }

    const user = await prisma.user.upsert({
      where: { id: authUserId },
      create: {
        id: authUserId,
        email,
        name: parsed.data.name.trim(),
        phone: parsed.data.phone?.trim() || null,
        role: staffRole.accessLevel,
        staffRoleId: staffRole.id,
      },
      update: {
        email,
        name: parsed.data.name.trim(),
        phone: parsed.data.phone?.trim() || null,
        role: staffRole.accessLevel,
        staffRoleId: staffRole.id,
      },
      include: { staffRole: true },
    });

    revalidatePath("/admin/roles");
    return { data: mapStaffMember(user) };
  } catch (error) {
    const auth = authErrorResult<AdminStaffMember>(error);
    if (auth) return auth;
    console.error("createStaffAccountAction:", error);
    return { error: "Failed to create staff account." };
  }
}

export async function listStaffInvitesAction(): Promise<ActionResult<AdminStaffInvite[]>> {
  try {
    await requireAdmin();
    const invites = await prisma.staffInvite.findMany({
      include: {
        role: true,
        invitedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return { data: invites.map(mapStaffInvite) };
  } catch (error) {
    const auth = authErrorResult<AdminStaffInvite[]>(error);
    if (auth) return auth;
    console.error("listStaffInvitesAction:", error);
    return { error: "Could not load invites." };
  }
}

export async function inviteStaffAction(
  input: InviteStaffInput
): Promise<ActionResult<AdminStaffInvite>> {
  try {
    const adminUser = await requireAdmin();
    const parsed = inviteStaffSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid invite details." };
    }

    const email = parsed.data.email.trim().toLowerCase();
    const staffRole = await prisma.staffRole.findUnique({
      where: { id: parsed.data.roleId },
    });
    if (!staffRole) return { error: "Selected role was not found." };
    if (staffRole.accessLevel === Role.CUSTOMER) {
      return { error: "Customer role cannot receive staff invites." };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return { error: "This email already has an account." };

    await prisma.staffInvite.updateMany({
      where: { email, status: InviteStatus.PENDING },
      data: { status: InviteStatus.REVOKED },
    });

    const token = createInviteToken();
    const invite = await prisma.staffInvite.create({
      data: {
        email,
        name: parsed.data.name?.trim() || null,
        roleId: staffRole.id,
        tokenHash: hashInviteToken(token),
        invitedById: adminUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      include: {
        role: true,
        invitedBy: { select: { name: true } },
      },
    });

    const inviteUrl = `${getAppUrl()}/invite/${token}`;
    const emailResult = await sendStaffInviteEmail({
      to: email,
      inviteeName: invite.name,
      roleName: staffRole.name,
      inviteUrl,
      invitedByName: adminUser.name,
    });

    if (!emailResult.ok) {
      return {
        error: `Invite saved but email failed: ${emailResult.error}. You can copy the invite link.`,
        data: mapStaffInvite(invite),
        previewUrl: inviteUrl,
      };
    }

    revalidatePath("/admin/roles");
    return {
      data: mapStaffInvite(invite),
      previewUrl: emailResult.previewUrl,
    };
  } catch (error) {
    const auth = authErrorResult<AdminStaffInvite>(error);
    if (auth) return auth;
    console.error("inviteStaffAction:", error);
    return { error: "Failed to send invite." };
  }
}

export async function revokeStaffInviteAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const invite = await prisma.staffInvite.findUnique({ where: { id } });
    if (!invite) return { error: "Invite not found." };
    if (invite.status !== InviteStatus.PENDING) {
      return { error: "Only pending invites can be revoked." };
    }
    await prisma.staffInvite.update({
      where: { id },
      data: { status: InviteStatus.REVOKED },
    });
    revalidatePath("/admin/roles");
    return {};
  } catch (error) {
    const auth = authErrorResult(error);
    if (auth) return auth;
    return { error: "Failed to revoke invite." };
  }
}

export async function getInviteByTokenAction(token: string): Promise<
  ActionResult<{
    email: string;
    name: string;
    roleName: string;
    expiresAt: string;
  }>
> {
  try {
    if (!token || token.length < 20) return { error: "Invalid invite link." };
    const invite = await prisma.staffInvite.findUnique({
      where: { tokenHash: hashInviteToken(token) },
      include: { role: true },
    });
    if (!invite || invite.status !== InviteStatus.PENDING) {
      return { error: "This invite is invalid or already used." };
    }
    if (invite.expiresAt.getTime() < Date.now()) {
      await prisma.staffInvite.update({
        where: { id: invite.id },
        data: { status: InviteStatus.EXPIRED },
      });
      return { error: "This invite has expired. Ask an admin to resend it." };
    }

    return {
      data: {
        email: invite.email,
        name: invite.name ?? "",
        roleName: invite.role.name,
        expiresAt: invite.expiresAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("getInviteByTokenAction:", error);
    return { error: "Could not load invite." };
  }
}

export async function acceptStaffInviteAction(
  input: AcceptInviteInput
): Promise<ActionResult<{ redirectTo: string }>> {
  try {
    const parsed = acceptInviteSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid form details." };
    }

    const invite = await prisma.staffInvite.findUnique({
      where: { tokenHash: hashInviteToken(parsed.data.token) },
      include: { role: true },
    });
    if (!invite || invite.status !== InviteStatus.PENDING) {
      return { error: "This invite is invalid or already used." };
    }
    if (invite.expiresAt.getTime() < Date.now()) {
      await prisma.staffInvite.update({
        where: { id: invite.id },
        data: { status: InviteStatus.EXPIRED },
      });
      return { error: "This invite has expired." };
    }

    const email = invite.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { error: "An account with this email already exists. Please sign in." };

    let authUserId: string;
    try {
      const admin = createAdminClient();
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password: parsed.data.password,
        email_confirm: true,
        user_metadata: {
          full_name: parsed.data.name,
          role: invite.role.accessLevel,
          staff_role_id: invite.role.id,
        },
      });
      if (error || !data.user) {
        return { error: error?.message ?? "Failed to create your account." };
      }
      authUserId = data.user.id;
    } catch (error) {
      console.error("accept invite createUser failed:", error);
      return { error: "Could not activate account. Contact an administrator." };
    }

    await prisma.user.upsert({
      where: { id: authUserId },
      create: {
        id: authUserId,
        email,
        name: parsed.data.name.trim(),
        role: invite.role.accessLevel,
        staffRoleId: invite.role.id,
      },
      update: {
        email,
        name: parsed.data.name.trim(),
        role: invite.role.accessLevel,
        staffRoleId: invite.role.id,
      },
    });

    await prisma.staffInvite.update({
      where: { id: invite.id },
      data: {
        status: InviteStatus.ACCEPTED,
        acceptedAt: new Date(),
        name: parsed.data.name.trim(),
      },
    });

    return {
      data: {
        redirectTo: invite.role.accessLevel === Role.ADMIN ? "/admin" : "/dashboard",
      },
    };
  } catch (error) {
    console.error("acceptStaffInviteAction:", error);
    return { error: "Failed to accept invite." };
  }
}
