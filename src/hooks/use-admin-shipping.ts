"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createShippingCourierAction,
  createShippingZoneAction,
  deleteShippingCourierAction,
  deleteShippingZoneAction,
  listShippingCouriersAction,
  listShippingZonesAction,
  toggleShippingCourierActiveAction,
  toggleShippingZoneActiveAction,
  updateShippingCourierAction,
  updateShippingZoneAction,
} from "@/lib/shipping/actions";
import type {
  ShippingCourierInput,
  ShippingZoneInput,
} from "@/lib/shipping/schemas";

export const ADMIN_SHIPPING_ZONES_KEY = ["admin-shipping-zones"] as const;
export const ADMIN_SHIPPING_COURIERS_KEY = ["admin-shipping-couriers"] as const;

export function useAdminShippingZones() {
  return useQuery({
    queryKey: ADMIN_SHIPPING_ZONES_KEY,
    queryFn: async () => {
      const result = await listShippingZonesAction();
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
  });
}

export function useAdminShippingCouriers() {
  return useQuery({
    queryKey: ADMIN_SHIPPING_COURIERS_KEY,
    queryFn: async () => {
      const result = await listShippingCouriersAction();
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
  });
}

export function useShippingMutations() {
  const queryClient = useQueryClient();
  const invalidateZones = () =>
    void queryClient.invalidateQueries({ queryKey: ADMIN_SHIPPING_ZONES_KEY });
  const invalidateCouriers = () =>
    void queryClient.invalidateQueries({ queryKey: ADMIN_SHIPPING_COURIERS_KEY });

  const createZone = useMutation({
    mutationFn: async (input: ShippingZoneInput) => {
      const result = await createShippingZoneAction(input);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidateZones,
  });

  const updateZone = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ShippingZoneInput }) => {
      const result = await updateShippingZoneAction(id, input);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidateZones,
  });

  const deleteZone = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteShippingZoneAction(id);
      if (result.error) throw new Error(result.error);
    },
    onSuccess: invalidateZones,
  });

  const toggleZone = useMutation({
    mutationFn: async (id: string) => {
      const result = await toggleShippingZoneActiveAction(id);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidateZones,
  });

  const createCourier = useMutation({
    mutationFn: async (input: ShippingCourierInput) => {
      const result = await createShippingCourierAction(input);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidateCouriers,
  });

  const updateCourier = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ShippingCourierInput }) => {
      const result = await updateShippingCourierAction(id, input);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidateCouriers,
  });

  const deleteCourier = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteShippingCourierAction(id);
      if (result.error) throw new Error(result.error);
    },
    onSuccess: invalidateCouriers,
  });

  const toggleCourier = useMutation({
    mutationFn: async (id: string) => {
      const result = await toggleShippingCourierActiveAction(id);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidateCouriers,
  });

  return {
    createZone,
    updateZone,
    deleteZone,
    toggleZone,
    createCourier,
    updateCourier,
    deleteCourier,
    toggleCourier,
  };
}
