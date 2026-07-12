"use server";

import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

import { AdminAuthError, requireAdmin } from "@/lib/admin/require-admin";
import { mapBlogPostToAdmin, type AdminBlogPost } from "@/lib/blog/mapper";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type BlogUploadResult = {
  error?: string;
  url?: string;
  data?: AdminBlogPost;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);

function extensionForMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

async function removeLocalUpload(publicUrl: string | null | undefined) {
  if (!publicUrl?.startsWith("/uploads/blog/")) return;
  try {
    await unlink(path.join(process.cwd(), "public", publicUrl));
  } catch {
    // File may already be gone
  }
}

export async function saveBlogFeaturedImageAction(
  postId: string,
  formData: FormData
): Promise<BlogUploadResult> {
  try {
    await requireAdmin();

    const post = await prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) return { error: "Post not found." };

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { error: "Please choose an image file." };
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return { error: "Only JPG, PNG, WEBP, or GIF images are allowed." };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { error: "Image must be 5MB or smaller." };
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "blog", postId);
    await mkdir(uploadDir, { recursive: true });

    const ext = extensionForMime(file.type);
    const filename = `${randomUUID()}.${ext}`;
    const absolutePath = path.join(uploadDir, filename);
    await writeFile(absolutePath, Buffer.from(await file.arrayBuffer()));

    const publicUrl = `/uploads/blog/${postId}/${filename}`;
    await removeLocalUpload(post.featuredImageUrl);

    const updated = await prisma.blogPost.update({
      where: { id: postId },
      data: { featuredImageUrl: publicUrl },
    });

    revalidatePath("/admin/blog");
    revalidatePath(`/admin/blog/${postId}/edit`);
    revalidatePath("/blog");
    revalidatePath(`/blog/${updated.slug}`);

    return { url: publicUrl, data: mapBlogPostToAdmin(updated) };
  } catch (error) {
    if (
      error instanceof AdminAuthError ||
      (error instanceof Error && error.name === "AdminAuthError")
    ) {
      return { error: error instanceof Error ? error.message : "Unauthorized" };
    }
    console.error("Blog image upload failed:", error);
    return { error: "Failed to upload image. Please try again." };
  }
}

export async function deleteBlogFeaturedImageAction(
  postId: string
): Promise<BlogUploadResult> {
  try {
    await requireAdmin();

    const post = await prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) return { error: "Post not found." };

    await removeLocalUpload(post.featuredImageUrl);

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
