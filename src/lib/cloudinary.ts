import { randomUUID } from "crypto";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export type CloudinaryUploadResult = {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
};

const ROOT_FOLDER = "well-health";

function assertCloudinaryConfigured() {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }
}

function extensionForMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

/** Extract Cloudinary public_id from a secure delivery URL (best-effort). */
export function getCloudinaryPublicId(url: string | null | undefined): string | null {
  if (!url || !url.includes("res.cloudinary.com")) return null;
  try {
    const parsed = new URL(url);
    // /<cloud>/image/upload/v123/folder/name.ext  OR with transforms
    const marker = "/upload/";
    const idx = parsed.pathname.indexOf(marker);
    if (idx < 0) return null;
    let rest = parsed.pathname.slice(idx + marker.length);
    // drop version segment v123456
    rest = rest.replace(/^v\d+\//, "");
    // drop transform segments (contain , or _w_ style) until folder path
    while (rest && /[,_]/.test(rest.split("/")[0] ?? "") && rest.includes("/")) {
      rest = rest.slice(rest.indexOf("/") + 1);
      rest = rest.replace(/^v\d+\//, "");
    }
    const withoutExt = rest.replace(/\.[a-zA-Z0-9]+$/, "");
    return withoutExt || null;
  } catch {
    return null;
  }
}

export async function uploadImageToCloudinary(
  file: File,
  options: {
    folder: string;
    publicId?: string;
    maxBytes?: number;
    allowedTypes?: Set<string>;
  }
): Promise<CloudinaryUploadResult> {
  assertCloudinaryConfigured();

  const allowed =
    options.allowedTypes ??
    new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);
  const maxBytes = options.maxBytes ?? 5 * 1024 * 1024;

  if (!allowed.has(file.type)) {
    throw new Error("Only JPG, PNG, WEBP, or GIF images are allowed.");
  }
  if (file.size > maxBytes) {
    throw new Error(`Image must be ${Math.round(maxBytes / (1024 * 1024))}MB or smaller.`);
  }

  const folder = `${ROOT_FOLDER}/${options.folder}`.replace(/\/+/g, "/");
  const publicId =
    options.publicId ?? `${randomUUID()}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<{
    secure_url: string;
    public_id: string;
    width?: number;
    height?: number;
    bytes?: number;
    format?: string;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "image",
        overwrite: Boolean(options.publicId),
        unique_filename: !options.publicId,
        use_filename: false,
        format: extensionForMime(file.type),
      },
      (error, uploaded) => {
        if (error || !uploaded?.secure_url || !uploaded.public_id) {
          reject(error ?? new Error("Cloudinary upload returned an empty result."));
          return;
        }
        resolve({
          secure_url: uploaded.secure_url,
          public_id: uploaded.public_id,
          width: uploaded.width,
          height: uploaded.height,
          bytes: uploaded.bytes,
          format: uploaded.format,
        });
      }
    );
    stream.end(buffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    format: result.format,
  };
}

/** Delete a Cloudinary asset by URL or public_id. Ignores local /uploads paths. */
export async function deleteCloudinaryImage(
  urlOrPublicId: string | null | undefined
): Promise<void> {
  if (!urlOrPublicId) return;

  let publicId = urlOrPublicId;
  if (urlOrPublicId.startsWith("http")) {
    const extracted = getCloudinaryPublicId(urlOrPublicId);
    if (!extracted) return;
    publicId = extracted;
  } else if (urlOrPublicId.startsWith("/uploads/")) {
    // Legacy local file — nothing to delete in Cloudinary
    return;
  }

  assertCloudinaryConfigured();
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    console.error("Cloudinary delete failed:", publicId, error);
  }
}
