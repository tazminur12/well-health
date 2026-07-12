"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  changeCustomerPasswordAction,
  createCustomerAddressAction,
  deleteCustomerAccountAction,
  deleteCustomerAddressAction,
  getCustomerProfileAction,
  setDefaultCustomerAddressAction,
  updateCustomerAddressAction,
  updateCustomerPreferencesAction,
  updateCustomerProfileAction,
  uploadCustomerAvatarAction,
  type CustomerProfile,
} from "@/lib/profile/actions";
import type {
  CustomerAddressInput,
  CustomerPasswordChangeInput,
  CustomerPreferencesInput,
  CustomerProfileUpdateInput,
  DeleteAccountInput,
} from "@/lib/profile/schemas";

export const CUSTOMER_PROFILE_KEY = ["customer-profile"] as const;

export function useCustomerProfile() {
  return useQuery({
    queryKey: CUSTOMER_PROFILE_KEY,
    queryFn: async () => {
      const result = await getCustomerProfileAction();
      if (result.error) throw new Error(result.error);
      return result.data as CustomerProfile;
    },
  });
}

export function useCustomerProfileMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: CUSTOMER_PROFILE_KEY });

  const updateProfile = useMutation({
    mutationFn: async (input: CustomerProfileUpdateInput) => {
      const result = await updateCustomerProfileAction(input);
      if (result.error) throw new Error(result.error);
      return result.data as CustomerProfile;
    },
    onSuccess: invalidate,
  });

  const updatePreferences = useMutation({
    mutationFn: async (input: CustomerPreferencesInput) => {
      const result = await updateCustomerPreferencesAction(input);
      if (result.error) throw new Error(result.error);
      return result.data as CustomerProfile;
    },
    onSuccess: invalidate,
  });

  const changePassword = useMutation({
    mutationFn: async (input: CustomerPasswordChangeInput) => {
      const result = await changeCustomerPasswordAction(input);
      if (result.error) throw new Error(result.error);
      return result.success;
    },
  });

  const createAddress = useMutation({
    mutationFn: async (input: CustomerAddressInput) => {
      const result = await createCustomerAddressAction(input);
      if (result.error) throw new Error(result.error);
      return result.data as CustomerProfile;
    },
    onSuccess: invalidate,
  });

  const updateAddress = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: CustomerAddressInput }) => {
      const result = await updateCustomerAddressAction(id, input);
      if (result.error) throw new Error(result.error);
      return result.data as CustomerProfile;
    },
    onSuccess: invalidate,
  });

  const deleteAddress = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteCustomerAddressAction(id);
      if (result.error) throw new Error(result.error);
      return result.data as CustomerProfile;
    },
    onSuccess: invalidate,
  });

  const setDefaultAddress = useMutation({
    mutationFn: async (id: string) => {
      const result = await setDefaultCustomerAddressAction(id);
      if (result.error) throw new Error(result.error);
      return result.data as CustomerProfile;
    },
    onSuccess: invalidate,
  });

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadCustomerAvatarAction(formData);
      if (result.error) throw new Error(result.error);
      return result.data as CustomerProfile;
    },
    onSuccess: invalidate,
  });

  const deleteAccount = useMutation({
    mutationFn: async (input: DeleteAccountInput) => {
      const result = await deleteCustomerAccountAction(input);
      if (result?.error) throw new Error(result.error);
      return result;
    },
  });

  return {
    updateProfile,
    updatePreferences,
    changePassword,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    uploadAvatar,
    deleteAccount,
  };
}
