"use server";

import { revalidatePath } from "next/cache";

import { AdminAuthError, requireAdminPermission } from "@/lib/admin/require-admin";
import { mapBlogPostToAdmin, type AdminBlogPost } from "@/lib/blog/mapper";
import { deleteCloudinaryImage, uploadImageToCloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export type BlogUploadResult = {
  error?: string;
  url?: string;
  data?: AdminBlogPost;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);

export async function saveBlogFeaturedImageAction(
  postId: string,
  formData: FormData
): Promise<BlogUploadResult> {
  try {
    await requireAdminPermission("blog");

    const post = await prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) return { error: "Post not found." };

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { error: "Please choose an image file." };
    }

    const uploaded = await uploadImageToCloudinary(file, {
      folder: `blog/${postId}`,
      maxBytes: MAX_FILE_SIZE,
      allowedTypes: ALLOWED_TYPES,
    });

    await deleteCloudinaryImage(post.featuredImageUrl);

    const updated = await prisma.blogPost.update({
      where: { id: postId },
      data: { featuredImageUrl: uploaded.url },
    });

    revalidatePath("/admin/blog");
    revalidatePath(`/admin/blog/${postId}/edit`);
    revalidatePath("/blog");
    revalidatePath(`/blog/${updated.slug}`);

    return { url: uploaded.url, data: mapBlogPostToAdmin(updated) };
  } catch (error) {
    if (
      error instanceof AdminAuthError ||
      (error instanceof Error && error.name === "AdminAuthError")
    ) {
      return { error: error instanceof Error ? error.message : "Unauthorized" };
    }
    console.error("Blog image upload failed:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to upload image. Please try again.",
    };
  }
}

export async function deleteBlogFeaturedImageAction(
  postId: string
): Promise<BlogUploadResult> {
  try {
    await requireAdminPermission("blog");

    const post = await prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) return { error: "Post not found." };

    await deleteCloudinaryImage(post.featuredImageUrl);

    const updated = await prisma.blogPost.update({
      where: { id: postId },
      data: { featuredImageUrl: null },
    });

    revalidatePath("/admin/blog");
    revalidatePath(`/admin/blog/${postId}/edit`);
    revalidatePath("/blog");
    revalidatePath(`/blog/${updated.slug}`);

    return { data: mapBlogPostToAdmin(updated) };
  } catch (error) {
    console.error("Delete blog image failed:", error);
    return { error: "Failed to remove featured image." };
  }
}
