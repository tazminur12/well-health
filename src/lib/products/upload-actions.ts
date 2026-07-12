"use server";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { AdminAuthError, requireAdmin } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";

export type UploadImagesResult = {
  error?: string;
  urls?: string[];
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);

function extensionForMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

/** Save product images to /public/uploads/products and ProductImage rows. */
export async function saveProductImagesAction(
  productId: string,
  formData: FormData
): Promise<UploadImagesResult> {
  try {
    await requireAdmin();

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });
    if (!product) return { error: "Product not found." };

    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (files.length === 0) {
      return { urls: [] };
    }

    const existingCount = product.images.length;
    if (existingCount + files.length > 6) {
      return { error: "Maximum 6 images allowed per product." };
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "products", productId);
    await mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];
    let sortOrder = existingCount;

    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) {
        return { error: "Only JPG, PNG, WEBP, or GIF images are allowed." };
      }
      if (file.size > MAX_FILE_SIZE) {
        return { error: "Each image must be 5MB or smaller." };
      }

      const ext = extensionForMime(file.type);
      const filename = `${randomUUID()}.${ext}`;
      const absolutePath = path.join(uploadDir, filename);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(absolutePath, buffer);

      const publicUrl = `/uploads/products/${productId}/${filename}`;
      const isPrimary = existingCount === 0 && sortOrder === 0;

      await prisma.productImage.create({
        data: {
          productId,
          url: publicUrl,
          alt: product.name,
          sortOrder,
          isPrimary,
        },
      });

      urls.push(publicUrl);
      sortOrder += 1;
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        imageCount: existingCount + urls.length,
      },
    });

    return { urls };
  } catch (error) {
    if (
      error instanceof AdminAuthError ||
      (error instanceof Error && error.name === "AdminAuthError")
    ) {
      return { error: error instanceof Error ? error.message : "Unauthorized" };
    }
    console.error("Image upload failed:", error);
    return { error: "Failed to upload images. Please try again." };
  }
}

export async function deleteProductImageAction(
  productId: string,
  imageId: string
): Promise<{ error?: string }> {
  try {
    await requireAdmin();

    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });
    if (!image) return { error: "Image not found." };

    await prisma.productImage.delete({ where: { id: imageId } });

    const remaining = await prisma.productImage.count({ where: { productId } });
    await prisma.product.update({
      where: { id: productId },
      data: { imageCount: remaining },
    });

    if (image.isPrimary && remaining > 0) {
      const next = await prisma.productImage.findFirst({
        where: { productId },
        orderBy: { sortOrder: "asc" },
      });
      if (next) {
        await prisma.productImage.update({
          where: { id: next.id },
          data: { isPrimary: true },
        });
      }
    }

    return {};
  } catch (error) {
    console.error("Delete image failed:", error);
    return { error: "Failed to delete image." };
  }
}
