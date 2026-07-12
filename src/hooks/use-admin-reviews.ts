"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createReviewAction,
  deleteReviewAction,
  listReviewProductOptionsAction,
  listReviewsAction,
  setReviewStatusAction,
  toggleReviewFeaturedAction,
  updateReviewReplyAction,
} from "@/lib/reviews/actions";
import type { CreateReviewInput, ReviewStatusValue } from "@/lib/reviews/schemas";

export const ADMIN_REVIEWS_KEY = ["admin-reviews"] as const;
export const ADMIN_REVIEW_PRODUCTS_KEY = ["admin-review-products"] as const;

export function useAdminReviews() {
  return useQuery({
    queryKey: ADMIN_REVIEWS_KEY,
    queryFn: async () => {
      const result = await listReviewsAction();
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
  });
}

export function useReviewProductOptions(enabled = true) {
  return useQuery({
    queryKey: ADMIN_REVIEW_PRODUCTS_KEY,
    enabled,
    queryFn: async () => {
      const result = await listReviewProductOptionsAction();
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
  });
}

export function useReviewMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ADMIN_REVIEWS_KEY });

  const createReview = useMutation({
    mutationFn: async (input: CreateReviewInput) => {
      const result = await createReviewAction(input);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ReviewStatusValue }) => {
      const result = await setReviewStatusAction(id, status);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  const toggleFeatured = useMutation({
    mutationFn: async (id: string) => {
      const result = await toggleReviewFeaturedAction(id);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  const updateReply = useMutation({
    mutationFn: async ({ id, adminReply }: { id: string; adminReply: string }) => {
      const result = await updateReviewReplyAction(id, adminReply);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteReviewAction(id);
      if (result.error) throw new Error(result.error);
    },
    onSuccess: invalidate,
  });

  return { createReview, setStatus, toggleFeatured, updateReply, remove };
}
