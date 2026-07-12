"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createFaqItemAction,
  createHeroSlideAction,
  createTrustBadgeAction,
  deleteFaqItemAction,
  deleteHeroSlideAction,
  deleteTrustBadgeAction,
  getAboutHomeAction,
  getSiteAssetsAction,
  listFaqItemsAction,
  listHeroSlidesAction,
  listTrustBadgesAction,
  reorderHeroSlidesAction,
  toggleFaqItemActiveAction,
  toggleHeroSlideActiveAction,
  updateAboutHomeAction,
  updateFaqItemAction,
  updateHeroSlideAction,
  updateSiteAssetsAction,
  updateTrustBadgeAction,
} from "@/lib/content/actions";
import type {
  AboutHomeContent,
  FaqItemInput,
  HeroSlideInput,
  SiteAssetsContent,
  TrustBadgeInput,
} from "@/lib/content/schemas";
import { uploadContentImageAction } from "@/lib/content/upload-actions";

export const ADMIN_CONTENT_KEY = ["admin-content"] as const;

export function useAdminHeroSlides() {
  return useQuery({
    queryKey: [...ADMIN_CONTENT_KEY, "hero"],
    queryFn: async () => {
      const result = await listHeroSlidesAction();
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
  });
}

export function useAdminTrustBadges() {
  return useQuery({
    queryKey: [...ADMIN_CONTENT_KEY, "trust"],
    queryFn: async () => {
      const result = await listTrustBadgesAction();
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
  });
}

export function useAdminFaqItems() {
  return useQuery({
    queryKey: [...ADMIN_CONTENT_KEY, "faq"],
    queryFn: async () => {
      const result = await listFaqItemsAction();
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
  });
}

export function useAdminAboutHome() {
  return useQuery({
    queryKey: [...ADMIN_CONTENT_KEY, "about"],
    queryFn: async () => {
      const result = await getAboutHomeAction();
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
  });
}

export function useAdminSiteAssets() {
  return useQuery({
    queryKey: [...ADMIN_CONTENT_KEY, "assets"],
    queryFn: async () => {
      const result = await getSiteAssetsAction();
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
  });
}

export function useContentMutations() {
  const queryClient = useQueryClient();
  const invalidate = (key?: string) =>
    queryClient.invalidateQueries({
      queryKey: key ? [...ADMIN_CONTENT_KEY, key] : ADMIN_CONTENT_KEY,
    });

  return {
    createHero: useMutation({
      mutationFn: async (input: HeroSlideInput) => {
        const result = await createHeroSlideAction(input);
        if (result.error) throw new Error(result.error);
        return result.data!;
      },
      onSuccess: () => invalidate("hero"),
    }),
    updateHero: useMutation({
      mutationFn: async ({ id, input }: { id: string; input: HeroSlideInput }) => {
        const result = await updateHeroSlideAction(id, input);
        if (result.error) throw new Error(result.error);
        return result.data!;
      },
      onSuccess: () => invalidate("hero"),
    }),
    deleteHero: useMutation({
      mutationFn: async (id: string) => {
        const result = await deleteHeroSlideAction(id);
        if (result.error) throw new Error(result.error);
      },
      onSuccess: () => invalidate("hero"),
    }),
    toggleHero: useMutation({
      mutationFn: async (id: string) => {
        const result = await toggleHeroSlideActiveAction(id);
        if (result.error) throw new Error(result.error);
        return result.data!;
      },
      onSuccess: () => invalidate("hero"),
    }),
    reorderHero: useMutation({
      mutationFn: async (ids: string[]) => {
        const result = await reorderHeroSlidesAction(ids);
        if (result.error) throw new Error(result.error);
      },
      onSuccess: () => invalidate("hero"),
    }),
    createBadge: useMutation({
      mutationFn: async (input: TrustBadgeInput) => {
        const result = await createTrustBadgeAction(input);
        if (result.error) throw new Error(result.error);
        return result.data!;
      },
      onSuccess: () => invalidate("trust"),
    }),
    updateBadge: useMutation({
      mutationFn: async ({ id, input }: { id: string; input: TrustBadgeInput }) => {
        const result = await updateTrustBadgeAction(id, input);
        if (result.error) throw new Error(result.error);
        return result.data!;
      },
      onSuccess: () => invalidate("trust"),
    }),
    deleteBadge: useMutation({
      mutationFn: async (id: string) => {
        const result = await deleteTrustBadgeAction(id);
        if (result.error) throw new Error(result.error);
      },
      onSuccess: () => invalidate("trust"),
    }),
    createFaq: useMutation({
      mutationFn: async (input: FaqItemInput) => {
        const result = await createFaqItemAction(input);
        if (result.error) throw new Error(result.error);
        return result.data!;
      },
      onSuccess: () => invalidate("faq"),
    }),
    updateFaq: useMutation({
      mutationFn: async ({ id, input }: { id: string; input: FaqItemInput }) => {
        const result = await updateFaqItemAction(id, input);
        if (result.error) throw new Error(result.error);
        return result.data!;
      },
      onSuccess: () => invalidate("faq"),
    }),
    deleteFaq: useMutation({
      mutationFn: async (id: string) => {
        const result = await deleteFaqItemAction(id);
        if (result.error) throw new Error(result.error);
      },
      onSuccess: () => invalidate("faq"),
    }),
    toggleFaq: useMutation({
      mutationFn: async (id: string) => {
        const result = await toggleFaqItemActiveAction(id);
        if (result.error) throw new Error(result.error);
        return result.data!;
      },
      onSuccess: () => invalidate("faq"),
    }),
    updateAbout: useMutation({
      mutationFn: async (input: AboutHomeContent) => {
        const result = await updateAboutHomeAction(input);
        if (result.error) throw new Error(result.error);
        return result.data!;
      },
      onSuccess: () => invalidate("about"),
    }),
    updateAssets: useMutation({
      mutationFn: async (input: SiteAssetsContent) => {
        const result = await updateSiteAssetsAction(input);
        if (result.error) throw new Error(result.error);
        return result.data!;
      },
      onSuccess: () => invalidate("assets"),
    }),
    uploadImage: useMutation({
      mutationFn: async ({ folder, file }: { folder: string; file: File }) => {
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadContentImageAction(folder, formData);
        if (result.error) throw new Error(result.error);
        return result.url!;
      },
    }),
  };
}
