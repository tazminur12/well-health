"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createBlogPostAction,
  deleteBlogPostAction,
  deleteBlogPostsAction,
  getBlogPostAction,
  listBlogPostsAction,
  setBlogPostStatusAction,
  toggleBlogPostFeaturedAction,
  updateBlogPostAction,
} from "@/lib/blog/actions";
import type { AdminBlogPost, AdminBlogStatus } from "@/lib/blog/mapper";
import type { BlogPostInput } from "@/lib/blog/schemas";
import {
  deleteBlogFeaturedImageAction,
  saveBlogFeaturedImageAction,
} from "@/lib/blog/upload-actions";

export const ADMIN_BLOG_KEY = ["admin-blog"] as const;

export function useAdminBlogPosts() {
  return useQuery({
    queryKey: ADMIN_BLOG_KEY,
    queryFn: async () => {
      const result = await listBlogPostsAction();
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
  });
}

export function useAdminBlogPost(id?: string) {
  return useQuery({
    queryKey: [...ADMIN_BLOG_KEY, id],
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) return null;
      const result = await getBlogPostAction(id);
      if (result.error) throw new Error(result.error);
      return result.data ?? null;
    },
  });
}

export function useBlogMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ADMIN_BLOG_KEY });

  const createPost = useMutation({
    mutationFn: async (input: BlogPostInput) => {
      const result = await createBlogPostAction(input);
      if (result.error) throw new Error(result.error);
      return result.data as AdminBlogPost;
    },
    onSuccess: invalidate,
  });

  const updatePost = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: BlogPostInput }) => {
      const result = await updateBlogPostAction(id, input);
      if (result.error) throw new Error(result.error);
      return result.data as AdminBlogPost;
    },
    onSuccess: invalidate,
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteBlogPostAction(id);
      if (result.error) throw new Error(result.error);
    },
    onSuccess: invalidate,
  });

  const deletePosts = useMutation({
    mutationFn: async (ids: string[]) => {
      const result = await deleteBlogPostsAction(ids);
      if (result.error) throw new Error(result.error);
    },
    onSuccess: invalidate,
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AdminBlogStatus }) => {
      const result = await setBlogPostStatusAction(id, status);
      if (result.error) throw new Error(result.error);
      return result.data as AdminBlogPost;
    },
    onSuccess: invalidate,
  });

  const toggleFeatured = useMutation({
    mutationFn: async (id: string) => {
      const result = await toggleBlogPostFeaturedAction(id);
      if (result.error) throw new Error(result.error);
      return result.data as AdminBlogPost;
    },
    onSuccess: invalidate,
  });

  const uploadFeaturedImage = useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      const result = await saveBlogFeaturedImageAction(id, formData);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: invalidate,
  });

  const deleteFeaturedImage = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteBlogFeaturedImageAction(id);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: invalidate,
  });

  return {
    createPost,
    updatePost,
    deletePost,
    deletePosts,
    setStatus,
    toggleFeatured,
    uploadFeaturedImage,
    deleteFeaturedImage,
  };
}
