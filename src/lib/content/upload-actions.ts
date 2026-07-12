"use server";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { AdminAuthError, requireAdmin } from "@/lib/admin/require-admin";
import { revalidatePath } from "next/cache";

export type ContentUploadResult = {
  error?: string;
  url?: string;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);

function extensionForMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

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
    if (!ALLOWED_TYPES.has(file.type)) {
      return { error: "Only JPG, PNG, WEBP, or GIF images are allowed." };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { error: "Image must be 5MB or smaller." };
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "content", safeFolder);
    await mkdir(uploadDir, { recursive: true });

    const filename = `${randomUUID()}.${extensionForMime(file.type)}`;
    await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

    const publicUrl = `/uploads/content/${safeFolder}/${filename}`;
    revalidatePath("/admin/content");
    revalidatePath("/");
    return { url: publicUrl };
  } catch (error) {
    if (
      error instanceof AdminAuthError ||
      (error instanceof Error && error.name === "AdminAuthError")
    ) {
      return { error: error instanceof Error ? error.message : "Unauthorized" };
    }
    console.error("Content image upload failed:", error);
    return { error: "Failed to upload image." };
  }
}
