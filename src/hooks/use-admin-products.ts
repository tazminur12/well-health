"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { AdminProduct } from "@/components/admin/products-data";
import {
  archiveProductsAction,
  createProductAction,
  deleteProductAction,
  deleteProductsAction,
  getProductAction,
  listProductsAction,
  setProductStatusAction,
  toggleProductFeaturedAction,
  updateProductAction,
} from "@/lib/products/actions";
import type { ProductInput } from "@/lib/products/schemas";
import {
  deleteProductImageAction,
  saveProductImagesAction,
} from "@/lib/products/upload-actions";

export const ADMIN_PRODUCTS_KEY = ["admin-products"] as const;

export function useAdminProducts() {
  return useQuery({
    queryKey: ADMIN_PRODUCTS_KEY,
    queryFn: async () => {
      const result = await listProductsAction();
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
  });
}

export function useAdminProduct(id?: string) {
  return useQuery({
    queryKey: [...ADMIN_PRODUCTS_KEY, id],
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) return null;
      const result = await getProductAction(id);
      if (result.error) throw new Error(result.error);
      return result.data ?? null;
    },
  });
}

export function useProductMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_KEY });

  const createProduct = useMutation({
    mutationFn: async (input: ProductInput) => {
      const result = await createProductAction(input);
      if (result.error) throw new Error(result.error);
      return result.data as AdminProduct;
    },
    onSuccess: invalidate,
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ProductInput }) => {
      const result = await updateProductAction(id, input);
      if (result.error) throw new Error(result.error);
      return result.data as AdminProduct;
    },
    onSuccess: invalidate,
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteProductAction(id);
      if (result.error) throw new Error(result.error);
    },
    onSuccess: invalidate,
  });

  const deleteProducts = useMutation({
    mutationFn: async (ids: string[]) => {
      const result = await deleteProductsAction(ids);
      if (result.error) throw new Error(result.error);
    },
    onSuccess: invalidate,
  });

  const archiveProducts = useMutation({
    mutationFn: async (ids: string[]) => {
      const result = await archiveProductsAction(ids);
      if (result.error) throw new Error(result.error);
    },
    onSuccess: invalidate,
  });

  const toggleFeatured = useMutation({
    mutationFn: async (id: string) => {
      const result = await toggleProductFeaturedAction(id);
      if (result.error) throw new Error(result.error);
      return result.data as AdminProduct;
    },
    onSuccess: invalidate,
  });

  const setStatus = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: AdminProduct["status"];
    }) => {
      const result = await setProductStatusAction(id, status);
      if (result.error) throw new Error(result.error);
      return result.data as AdminProduct;
    },
    onSuccess: invalidate,
  });

  const uploadImages = useMutation({
    mutationFn: async ({ id, files }: { id: string; files: File[] }) => {
      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }
      const result = await saveProductImagesAction(id, formData);
      if (result.error) throw new Error(result.error);
      return result.urls ?? [];
    },
    onSuccess: invalidate,
  });

  const deleteImage = useMutation({
    mutationFn: async ({
      productId,
      imageId,
    }: {
      productId: string;
      imageId: string;
    }) => {
      const result = await deleteProductImageAction(productId, imageId);
      if (result.error) throw new Error(result.error);
    },
    onSuccess: invalidate,
  });

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    deleteProducts,
    archiveProducts,
    toggleFeatured,
    setStatus,
    uploadImages,
    deleteImage,
  };
}
