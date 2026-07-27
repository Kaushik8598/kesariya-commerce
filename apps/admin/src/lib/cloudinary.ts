/**
 * Cloudinary direct (unsigned) upload utility.
 *
 * Uploads files from the browser straight to Cloudinary's upload API —
 * no backend proxy needed. Requires an **unsigned upload preset** configured
 * in the Cloudinary dashboard.
 *
 * Environment variables (in .env.local):
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME  – your Cloudinary cloud name
 *   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET – unsigned upload preset name
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  resourceType: "image" | "video" | "raw";
  bytes: number;
  duration?: number; // video only
}

export interface UploadOptions {
  /** "image" | "video" — defaults to auto-detect from file type */
  resourceType?: "image" | "video" | "auto";
  /** Optional folder inside Cloudinary (e.g. "kesariya/products") */
  folder?: string;
  /** Progress callback: percentage 0–100 */
  onProgress?: (percent: number) => void;
}

/**
 * Upload a single file to Cloudinary (unsigned, direct from browser).
 */
export async function uploadToCloudinary(
  file: File,
  options?: UploadOptions
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local"
    );
  }

  // Auto-detect resource type from MIME
  let resourceType: string = options?.resourceType || "auto";
  if (resourceType === "auto") {
    if (file.type.startsWith("video/")) {
      resourceType = "video";
    } else {
      resourceType = "image";
    }
  }

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  if (options?.folder) {
    formData.append("folder", options.folder);
  }

  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    // Progress tracking
    if (options?.onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          options.onProgress!(pct);
        }
      });
    }

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({
            url: data.url,
            secureUrl: data.secure_url,
            publicId: data.public_id,
            width: data.width || 0,
            height: data.height || 0,
            format: data.format || "",
            resourceType: data.resource_type || "image",
            bytes: data.bytes || 0,
            duration: data.duration,
          });
        } catch {
          reject(new Error("Failed to parse Cloudinary response"));
        }
      } else {
        let message = `Upload failed (${xhr.status})`;
        try {
          const err = JSON.parse(xhr.responseText);
          message = err?.error?.message || message;
        } catch {
          // ignore parse errors
        }
        reject(new Error(message));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error during upload"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload cancelled"));
    });

    xhr.send(formData);
  });
}

/**
 * Upload multiple files to Cloudinary sequentially.
 * Returns an array of results in the same order as the input files.
 */
export async function uploadMultipleToCloudinary(
  files: File[],
  options?: UploadOptions & {
    /** Called after each file completes: (completedIndex, total, result) */
    onFileComplete?: (
      index: number,
      total: number,
      result: CloudinaryUploadResult
    ) => void;
  }
): Promise<CloudinaryUploadResult[]> {
  const results: CloudinaryUploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const result = await uploadToCloudinary(files[i], {
      resourceType: options?.resourceType,
      folder: options?.folder,
      onProgress: options?.onProgress,
    });
    results.push(result);
    options?.onFileComplete?.(i, files.length, result);
  }

  return results;
}

/** Quick check: is a file a video? */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/");
}

/** Quick check: is a file an image? */
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

/** Quick check: is a URL string a video link or file? */
export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes("/video/upload/") ||
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".mov") ||
    lower.includes("youtube.com") ||
    lower.includes("youtu.be") ||
    lower.includes("vimeo.com")
  );
}

/** Accepted image MIME types */
export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif,image/avif";

/** Accepted video MIME types */
export const ACCEPTED_VIDEO_TYPES = "video/mp4,video/webm,video/mov,video/quicktime";

/** Max file sizes */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB
