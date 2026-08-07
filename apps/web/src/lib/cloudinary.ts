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
  duration?: number;
}

export interface UploadOptions {
  resourceType?: "image" | "video" | "auto";
  folder?: string;
  onProgress?: (percent: number) => void;
}

export async function uploadToCloudinary(
  file: File,
  options?: UploadOptions
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local"
    );
  }

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
        } catch {}
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

export async function uploadMultipleToCloudinary(
  files: File[],
  options?: UploadOptions & {
    onFileComplete?: (index: number, total: number, result: CloudinaryUploadResult) => void;
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

export async function uploadImageFile(file: File, folder?: string): Promise<string> {
  const res = await uploadToCloudinary(file, { resourceType: "image", folder });
  return res.secureUrl || res.url;
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/");
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

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

export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif,image/avif";
export const ACCEPTED_VIDEO_TYPES = "video/mp4,video/webm,video/mov,video/quicktime";
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
