"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createStaffAccountAction,
  createStaffRoleAction,
  deleteStaffRoleAction,
  getStaffRoleAction,
  inviteStaffAction,
  listStaffInvitesAction,
  listStaffMembersAction,
  listStaffRolesAction,
  revokeStaffInviteAction,
  updateStaffRoleAction,
  updateStaffRolePermissionsAction,
} from "@/lib/roles/actions";
import type {
  CreateStaffAccountInput,
  CreateStaffRoleInput,
  InviteStaffInput,
  UpdateStaffRoleInput,
  UpdateStaffRolePermissionsInput,
} from "@/lib/roles/schemas";

export const ADMIN_ROLES_KEY = ["admin-roles"] as const;

export function useStaffRoles() {
  return useQuery({
    queryKey: [...ADMIN_ROLES_KEY, "roles"],
    queryFn: async () => {
      const result = await listStaffRolesAction();
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
  });
}

export function useStaffRole(id?: string) {
  return useQuery({
    queryKey: [...ADMIN_ROLES_KEY, "role", id],
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) return null;
      const result = await getStaffRoleAction(id);
      if (result.error) throw new Error(result.error);
      return result.data ?? null;
    },
  });
}

export function useStaffMembers() {
  return useQuery({
    queryKey: [...ADMIN_ROLES_KEY, "members"],
    queryFn: async () => {
      const result = await listStaffMembersAction();
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
  });
}

export function useStaffInvites() {
  return useQuery({
    queryKey: [...ADMIN_ROLES_KEY, "invites"],
    queryFn: async () => {
      const result = await listStaffInvitesAction();
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
  });
}

export function useRoleMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ADMIN_ROLES_KEY });

  return {
    createRole: useMutation({
      mutationFn: async (input: CreateStaffRoleInput) => {
        const result = await createStaffRoleAction(input);
        if (result.error) throw new Error(result.error);
        return result.data!;
      },
      onSuccess: invalidate,
    }),
    updateRole: useMutation({
      mutationFn: async ({ id, input }: { id: string; input: UpdateStaffRoleInput }) => {
        const result = await updateStaffRoleAction(id, input);
        if (result.error) throw new Error(result.error);
        return result.data!;
      },
      onSuccess: invalidate,
    }),
    deleteRole: useMutation({
      mutationFn: async (id: string) => {
        const result = await deleteStaffRoleAction(id);
        if (result.error) throw new Error(result.error);
      },
      onSuccess: invalidate,
    }),
    updatePermissions: useMutation({
      mutationFn: async ({
        id,
        input,
      }: {
        id: string;
        input: UpdateStaffRolePermissionsInput;
      }) => {
        const result = await updateStaffRolePermissionsAction(id, input);
        if (result.error) throw new Error(result.error);
        return result.data!;
      },
      onSuccess: invalidate,
    }),
    createAccount: useMutation({
      mutationFn: async (input: CreateStaffAccountInput) => {
        const result = await createStaffAccountAction(input);
        if (result.error) throw new Error(result.error);
        return result.data!;
      },
      onSuccess: invalidate,
    }),
    inviteStaff: useMutation({
      mutationFn: async (input: InviteStaffInput) => {
        const result = await inviteStaffAction(input);
        if (result.error && !result.data) throw new Error(result.error);
        return result;
      },
      onSuccess: invalidate,
    }),
    revokeInvite: useMutation({
      mutationFn: async (id: string) => {
        const result = await revokeStaffInviteAction(id);
        if (result.error) throw new Error(result.error);
      },
      onSuccess: invalidate,
    }),
  };
}
