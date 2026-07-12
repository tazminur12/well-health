"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  changeAdminPasswordAction,
  getAdminProfileAction,
  removeAdminAvatarAction,
  updateAdminProfileAction,
  uploadAdminAvatarAction,
  type AdminProfile,
} from "@/lib/admin/profile-actions";
import type {
  AdminPasswordChangeInput,
  AdminProfileUpdateInput,
} from "@/lib/admin/profile-schemas";

export const ADMIN_PROFILE_KEY = ["admin-profile"] as const;

export function useAdminProfile() {
  return useQuery({
    queryKey: ADMIN_PROFILE_KEY,
    queryFn: async () => {
      const result = await getAdminProfileAction();
      if (result.error) throw new Error(result.error);
      return result.data as AdminProfile;
    },
  });
}

export function useAdminProfileMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ADMIN_PROFILE_KEY });

  const updateProfile = useMutation({
    mutationFn: async (input: AdminProfileUpdateInput) => {
      const result = await updateAdminProfileAction(input);
      if (result.error) throw new Error(result.error);
      return result.data as AdminProfile;
    },
    onSuccess: invalidate,
  });

  const changePassword = useMutation({
    mutationFn: async (input: AdminPasswordChangeInput) => {
      const result = await changeAdminPasswordAction(input);
      if (result.error) throw new Error(result.error);
      return result.success;
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadAdminAvatarAction(formData);
      if (result.error) throw new Error(result.error);
      return result.data as AdminProfile;
    },
    onSuccess: invalidate,
  });

  const removeAvatar = useMutation({
    mutationFn: async () => {
      const result = await removeAdminAvatarAction();
      if (result.error) throw new Error(result.error);
      return result.data as AdminProfile;
    },
    onSuccess: invalidate,
  });

  return { updateProfile, changePassword, uploadAvatar, removeAvatar };
}
