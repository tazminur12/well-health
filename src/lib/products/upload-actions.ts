"use server";

import { AdminAuthError, requireAdmin } from "@/lib/admin/require-admin";
import { deleteCloudinaryImage, uploadImageToCloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export type UploadImagesResult = {
  error?: string;
  urls?: string[];
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);

/** Upload product images to Cloudinary and create ProductImage rows. */
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

    const urls: string[] = [];
    let sortOrder = existingCount;

    for (const file of files) {
      const uploaded = await uploadImageToCloudinary(file, {
        folder: `products/${productId}`,
        maxBytes: MAX_FILE_SIZE,
        allowedTypes: ALLOWED_TYPES,
      });

      const isPrimary = existingCount === 0 && sortOrder === 0;

      await prisma.productImage.create({
        data: {
          productId,
          url: uploaded.url,
          alt: product.name,
          sortOrder,
          isPrimary,
        },
      });

      urls.push(uploaded.url);
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
    return {
      error:
        error instanceof Error ? error.message : "Failed to upload images. Please try again.",
    };
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
    await deleteCloudinaryImage(image.url);

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
