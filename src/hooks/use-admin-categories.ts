"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCategoryAction,
  deleteCategoryAction,
  listCategoriesAction,
  reorderCategoryAction,
  toggleCategoryActiveAction,
  updateCategoryAction,
} from "@/lib/categories/actions";
import type { CategoryInput } from "@/lib/categories/schemas";

export const ADMIN_CATEGORIES_KEY = ["admin-categories"] as const;

export function useAdminCategories() {
  return useQuery({
    queryKey: ADMIN_CATEGORIES_KEY,
    queryFn: async () => {
      const result = await listCategoriesAction();
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
  });
}

export function useCategoryMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_KEY });

  const createCategory = useMutation({
    mutationFn: async (input: CategoryInput) => {
      const result = await createCategoryAction(input);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: CategoryInput }) => {
      const result = await updateCategoryAction(id, input);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteCategoryAction(id);
      if (result.error) throw new Error(result.error);
    },
    onSuccess: invalidate,
  });

  const toggleActive = useMutation({
    mutationFn: async (id: string) => {
      const result = await toggleCategoryActiveAction(id);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  const reorder = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      const result = await reorderCategoryAction(id, direction);
      if (result.error) throw new Error(result.error);
    },
    onSuccess: invalidate,
  });

  return { createCategory, updateCategory, deleteCategory, toggleActive, reorder };
}
