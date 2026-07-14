"use server";

import { revalidatePath } from "next/cache";

import { AdminAuthError, requireAdmin } from "@/lib/admin/require-admin";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

export type ContentUploadResult = {
  error?: string;
  url?: string;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);

export async function uploadContentImageAction(
  folder: string,
  formData: FormData
): Promise<ContentUploadResult> {
  try {
    await requireAdmin();

    const safeFolder = folder.replace(/[^a-z0-9-_]/gi, "") || "misc";
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { error: "Please choose an image file." };
    }

    const uploaded = await uploadImageToCloudinary(file, {
      folder: `content/${safeFolder}`,
      maxBytes: MAX_FILE_SIZE,
      allowedTypes: ALLOWED_TYPES,
    });

    revalidatePath("/admin/content");
    revalidatePath("/");
    return { url: uploaded.url };
  } catch (error) {
    if (
      error instanceof AdminAuthError ||
      (error instanceof Error && error.name === "AdminAuthError")
    ) {
      return { error: error instanceof Error ? error.message : "Unauthorized" };
    }
    console.error("Content image upload failed:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to upload image.",
    };
  }
}
