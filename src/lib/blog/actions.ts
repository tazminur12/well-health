"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { AdminAuthError, requireAdmin } from "@/lib/admin/require-admin";
import {
  buildPrismaBlogData,
  mapBlogPostToAdmin,
  resolvePublishedAtForUpdate,
  toPrismaBlogStatus,
  type AdminBlogPost,
  type AdminBlogStatus,
} from "@/lib/blog/mapper";
import {
  blogPostIdsSchema,
  blogPostInputSchema,
  blogStatusSchema,
  type BlogPostInput,
} from "@/lib/blog/schemas";
import { prisma } from "@/lib/prisma";

export type BlogActionResult<T = undefined> = {
  error?: string;
  data?: T;
};

function handleActionError<T = undefined>(error: unknown): BlogActionResult<T> {
  if (
    error instanceof AdminAuthError ||
    (error instanceof Error && error.name === "AdminAuthError")
  ) {
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return { error: "A post with this slug already exists." };
    }
    if (error.code === "P2025") {
      return { error: "Post not found." };
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      error: "Database connection failed. Check DATABASE_URL and restart the server.",
    };
  }

  console.error("Blog action failed:", error);
  const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
  if (message.includes("findMany") || message.includes("undefined") || message.includes("blogPost")) {
    return {
      error: "Prisma client is out of date. Run `npx prisma generate` and restart `npm run dev`.",
    };
  }
  return { error: message };
}

function revalidateBlogPaths(slug?: string) {
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function listBlogPostsAction(): Promise<BlogActionResult<AdminBlogPost[]>> {
  try {
    await requireAdmin();
    const posts = await prisma.blogPost.findMany({
      orderBy: [{ updatedAt: "desc" }],
    });
    return { data: posts.map(mapBlogPostToAdmin) };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getBlogPostAction(
  id: string
): Promise<BlogActionResult<AdminBlogPost>> {
  try {
    await requireAdmin();
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) return { error: "Post not found." };
    return { data: mapBlogPostToAdmin(post) };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createBlogPostAction(
  input: BlogPostInput
): Promise<BlogActionResult<AdminBlogPost>> {
  try {
    const admin = await requireAdmin();
    const parsed = blogPostInputSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid post details" };
    }

    const authorExists = await prisma.user.findUnique({
      where: { id: admin.id },
      select: { id: true },
    });

    const post = await prisma.blogPost.create({
      data: {
        ...buildPrismaBlogData(parsed.data, {
          id: admin.id,
          name: admin.name,
          email: admin.email,
        }),
        authorId: authorExists ? admin.id : null,
      },
    });

    revalidateBlogPaths(post.slug);
    return { data: mapBlogPostToAdmin(post) };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateBlogPostAction(
  id: string,
  input: BlogPostInput
): Promise<BlogActionResult<AdminBlogPost>> {
  try {
    const admin = await requireAdmin();
    const parsed = blogPostInputSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid post details" };
    }

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) return { error: "Post not found." };

    const authorId = existing.authorId ?? admin.id;
    const authorExists = await prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true },
    });

    const base = buildPrismaBlogData(parsed.data, {
      id: authorId,
      name: existing.authorName ?? admin.name,
      email: admin.email,
    });

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...base,
        publishedAt: resolvePublishedAtForUpdate(parsed.data, existing.publishedAt),
        authorId: authorExists ? authorId : null,
        authorName: existing.authorName ?? base.authorName,
      },
    });

    revalidateBlogPaths(post.slug);
    if (existing.slug !== post.slug) {
      revalidatePath(`/blog/${existing.slug}`);
    }
    revalidatePath(`/admin/blog/${id}/edit`);
    return { data: mapBlogPostToAdmin(post) };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteBlogPostAction(id: string): Promise<BlogActionResult> {
  try {
    await requireAdmin();
    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) return { error: "Post not found." };
    await prisma.blogPost.delete({ where: { id } });
    revalidateBlogPaths(existing.slug);
    return {};
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteBlogPostsAction(ids: string[]): Promise<BlogActionResult> {
  try {
    await requireAdmin();
    const parsed = blogPostIdsSchema.safeParse({ ids });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid selection" };
    }

    const existing = await prisma.blogPost.findMany({
      where: { id: { in: parsed.data.ids } },
      select: { slug: true },
    });

    await prisma.blogPost.deleteMany({
      where: { id: { in: parsed.data.ids } },
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    for (const post of existing) {
      revalidatePath(`/blog/${post.slug}`);
    }
    return {};
  } catch (error) {
    return handleActionError(error);
  }
}

export async function setBlogPostStatusAction(
  id: string,
  status: AdminBlogStatus
): Promise<BlogActionResult<AdminBlogPost>> {
  try {
    await requireAdmin();
    const parsed = blogStatusSchema.safeParse(status);
    if (!parsed.success) return { error: "Invalid status." };

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) return { error: "Post not found." };

    const prismaStatus = toPrismaBlogStatus(parsed.data);
    let publishedAt = existing.publishedAt;
    let scheduledAt = existing.scheduledAt;

    if (parsed.data === "Published") {
      publishedAt = existing.publishedAt ?? new Date();
      scheduledAt = null;
    } else if (parsed.data === "Draft" || parsed.data === "Archived") {
      scheduledAt = null;
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: { status: prismaStatus, publishedAt, scheduledAt },
    });

    revalidateBlogPaths(post.slug);
    return { data: mapBlogPostToAdmin(post) };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function toggleBlogPostFeaturedAction(
  id: string
): Promise<BlogActionResult<AdminBlogPost>> {
  try {
    await requireAdmin();
    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) return { error: "Post not found." };

    const post = await prisma.blogPost.update({
      where: { id },
      data: { featured: !existing.featured },
    });

    revalidateBlogPaths(post.slug);
    return { data: mapBlogPostToAdmin(post) };
  } catch (error) {
    return handleActionError(error);
  }
}
