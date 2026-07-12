"use server";

import { Role, UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import type { AdminCustomer } from "@/components/admin/customers-data";
import { AdminAuthError, requireAdmin } from "@/lib/admin/require-admin";
import {
  mapUserToAdminCustomer,
  toPrismaCustomerStatus,
} from "@/lib/customers/mapper";
import {
  createCustomerSchema,
  updateCustomerSchema,
  type CreateCustomerInput,
  type UpdateCustomerInput,
} from "@/lib/customers/schemas";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

type ActionResult<T = undefined> = {
  error?: string;
  data?: T;
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

export async function listCustomersAction(): Promise<ActionResult<AdminCustomer[]>> {
  try {
    await requireAdmin();
    const users = await prisma.user.findMany({
      where: { role: Role.CUSTOMER },
      orderBy: { createdAt: "desc" },
    });
    return { data: users.map(mapUserToAdminCustomer) };
  } catch (error) {
    const auth = authErrorResult<AdminCustomer[]>(error);
    if (auth) return auth;
    console.error("listCustomersAction:", error);
    return { error: "Could not load customers." };
  }
}

export async function getCustomerAction(
  id: string
): Promise<ActionResult<AdminCustomer>> {
  try {
    await requireAdmin();
    const user = await prisma.user.findFirst({
      where: { id, role: Role.CUSTOMER },
    });
    if (!user) return { error: "Customer not found." };
    return { data: mapUserToAdminCustomer(user) };
  } catch (error) {
    const auth = authErrorResult<AdminCustomer>(error);
    if (auth) return auth;
    console.error("getCustomerAction:", error);
    return { error: "Could not load customer." };
  }
}

export async function createCustomerAction(
  input: CreateCustomerInput
): Promise<ActionResult<AdminCustomer>> {
  try {
    await requireAdmin();
    const parsed = createCustomerSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid customer details." };
    }

    const email = parsed.data.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "A user with this email already exists." };
    }

    let authUserId: string;
    try {
      const admin = createAdminClient();
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password: parsed.data.password,
        email_confirm: true,
        user_metadata: {
          full_name: parsed.data.name,
          phone: parsed.data.phone,
          role: "CUSTOMER",
        },
      });

      if (error || !data.user) {
        return { error: error?.message ?? "Failed to create auth account." };
      }
      authUserId = data.user.id;
    } catch (error) {
      console.error("Supabase admin createUser failed:", error);
      return {
        error:
          error instanceof Error && error.message.includes("Missing Supabase admin")
            ? "Server is missing SUPABASE_SERVICE_ROLE_KEY."
            : "Could not create login for this customer. Check Supabase service role key.",
      };
    }

    const user = await prisma.user.upsert({
      where: { id: authUserId },
      create: {
        id: authUserId,
        email,
        name: parsed.data.name.trim(),
        phone: parsed.data.phone.trim(),
        role: Role.CUSTOMER,
        status: UserStatus.ACTIVE,
        isVip: parsed.data.isVip,
        notes: parsed.data.notes?.trim() || null,
      },
      update: {
        email,
        name: parsed.data.name.trim(),
        phone: parsed.data.phone.trim(),
        role: Role.CUSTOMER,
        isVip: parsed.data.isVip,
        notes: parsed.data.notes?.trim() || null,
        status: UserStatus.ACTIVE,
      },
    });

    revalidatePath("/admin/customers");
    return { data: mapUserToAdminCustomer(user) };
  } catch (error) {
    const auth = authErrorResult<AdminCustomer>(error);
    if (auth) return auth;
    console.error("createCustomerAction:", error);
    return { error: "Failed to create customer." };
  }
}

export async function updateCustomerAction(
  id: string,
  input: UpdateCustomerInput
): Promise<ActionResult<AdminCustomer>> {
  try {
    await requireAdmin();
    const parsed = updateCustomerSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid customer details." };
    }

    const existing = await prisma.user.findFirst({
      where: { id, role: Role.CUSTOMER },
    });
    if (!existing) return { error: "Customer not found." };

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: parsed.data.name.trim(),
        phone: parsed.data.phone.trim(),
        isVip: parsed.data.isVip,
        status: toPrismaCustomerStatus(parsed.data.status),
        notes: parsed.data.notes?.trim() || null,
      },
    });

    try {
      const admin = createAdminClient();
      await admin.auth.admin.updateUserById(id, {
        user_metadata: {
          full_name: parsed.data.name.trim(),
          phone: parsed.data.phone.trim(),
          role: "CUSTOMER",
        },
        ban_duration: parsed.data.status === "Suspended" ? "876000h" : "none",
      });
    } catch (error) {
      console.error("Supabase metadata sync failed:", error);
    }

    revalidatePath("/admin/customers");
    revalidatePath(`/admin/customers/${id}`);
    return { data: mapUserToAdminCustomer(user) };
  } catch (error) {
    const auth = authErrorResult<AdminCustomer>(error);
    if (auth) return auth;
    console.error("updateCustomerAction:", error);
    return { error: "Failed to update customer." };
  }
}

export async function setCustomerStatusAction(
  id: string,
  status: "Active" | "Suspended"
): Promise<ActionResult<AdminCustomer>> {
  try {
    await requireAdmin();
    const existing = await prisma.user.findFirst({
      where: { id, role: Role.CUSTOMER },
    });
    if (!existing) return { error: "Customer not found." };

    const user = await prisma.user.update({
      where: { id },
      data: { status: toPrismaCustomerStatus(status) },
    });

    try {
      const admin = createAdminClient();
      await admin.auth.admin.updateUserById(id, {
        ban_duration: status === "Suspended" ? "876000h" : "none",
      });
    } catch (error) {
      console.error("Supabase ban sync failed:", error);
    }

    revalidatePath("/admin/customers");
    revalidatePath(`/admin/customers/${id}`);
    return { data: mapUserToAdminCustomer(user) };
  } catch (error) {
    const auth = authErrorResult<AdminCustomer>(error);
    if (auth) return auth;
    console.error("setCustomerStatusAction:", error);
    return { error: "Failed to update status." };
  }
}

export async function deleteCustomerAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const existing = await prisma.user.findFirst({
      where: { id, role: Role.CUSTOMER },
    });
    if (!existing) return { error: "Customer not found." };

    await prisma.user.delete({ where: { id } });

    try {
      const admin = createAdminClient();
      await admin.auth.admin.deleteUser(id);
    } catch (error) {
      console.error("Supabase deleteUser failed:", error);
    }

    revalidatePath("/admin/customers");
    return {};
  } catch (error) {
    const auth = authErrorResult(error);
    if (auth) return auth;
    console.error("deleteCustomerAction:", error);
    return { error: "Failed to delete customer." };
  }
}
