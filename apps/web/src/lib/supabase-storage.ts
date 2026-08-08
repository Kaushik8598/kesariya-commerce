import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ljkvkxffmgjkjatjbcbs.supabase.co";
const DUMMY_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqa3ZreGZmbWdqa2phdGpiY2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg4ODg4ODgsImV4cCI6MTk5NDQ2NDg4OH0.dummy_key";

export function getSupabaseClient() {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DUMMY_KEY;
  return createClient(SUPABASE_URL, anonKey);
}

export function getSupabaseAdminClient() {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DUMMY_KEY;
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false },
  });
}

export const supabase = {
  get storage() {
    return getSupabaseClient().storage;
  },
};

export interface SupabaseUploadResult {
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
  bucket?: string;
  onProgress?: (percent: number) => void;
}

/**
 * Uploads a file directly to Supabase Storage bucket with automated API route fallback.
 * Default bucket: "products" (Public bucket)
 */
export async function uploadToSupabase(
  file: File,
  options?: UploadOptions
): Promise<SupabaseUploadResult> {
  const bucketName = options?.bucket || "products";
  const folder = options?.folder || "uploads";

  // Format clean unique filename
  const cleanName = file.name ? file.name.replace(/[^a-zA-Z0-9.-]/g, "_") : "file";
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const filePath = `${folder}/${timestamp}-${randomStr}-${cleanName}`;

  options?.onProgress?.(10);

  // 1. Try direct Supabase JS client upload if ANON key exists
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (!error && data?.path) {
        options?.onProgress?.(80);
        const { data: publicUrlData } = client.storage
          .from(bucketName)
          .getPublicUrl(data.path);

        const publicUrl = publicUrlData.publicUrl;
        const fileExt = file.name ? file.name.split(".").pop() || "" : "";
        const resourceType = file.type.startsWith("video/") ? "video" : "image";

        options?.onProgress?.(100);

        return {
          url: publicUrl,
          secureUrl: publicUrl,
          publicId: data.path,
          width: 0,
          height: 0,
          format: fileExt,
          resourceType: resourceType as "image" | "video" | "raw",
          bytes: file.size,
        };
      }
    } catch (clientErr) {
      console.warn("Direct Supabase client upload failed, switching to /api/upload:", clientErr);
    }
  }

  // 2. Fallback to server API route /api/upload for 100% reliable upload
  options?.onProgress?.(40);
  const formData = new FormData();
  formData.append("file", file);
  formData.append("bucket", bucketName);
  formData.append("folder", folder);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  options?.onProgress?.(80);

  if (!res.ok) {
    let errorMsg = "Failed to upload file to Supabase Storage";
    try {
      const json = await res.json();
      errorMsg = json.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  const json = await res.json();
  const publicUrl = json.data?.url || json.url;
  const path = json.data?.path || json.path || filePath;
  const fileExt = file.name ? file.name.split(".").pop() || "" : "";
  const resourceType = file.type.startsWith("video/") ? "video" : "image";

  options?.onProgress?.(100);

  return {
    url: publicUrl,
    secureUrl: publicUrl,
    publicId: path,
    width: 0,
    height: 0,
    format: fileExt,
    resourceType: resourceType as "image" | "video" | "raw",
    bytes: file.size,
  };
}

export async function uploadMultipleToSupabase(
  files: File[],
  options?: UploadOptions & {
    onFileComplete?: (index: number, total: number, result: SupabaseUploadResult) => void;
  }
): Promise<SupabaseUploadResult[]> {
  const results: SupabaseUploadResult[] = [];
  for (let i = 0; i < files.length; i++) {
    const result = await uploadToSupabase(files[i], {
      resourceType: options?.resourceType,
      folder: options?.folder,
      bucket: options?.bucket,
      onProgress: options?.onProgress,
    });
    results.push(result);
    options?.onFileComplete?.(i, files.length, result);
  }
  return results;
}

export async function uploadImageFile(file: File, folder?: string): Promise<string> {
  const res = await uploadToSupabase(file, { resourceType: "image", folder });
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
    lower.includes("/video/") ||
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".mov") ||
    lower.includes("youtube.com") ||
    lower.includes("youtu.be") ||
    lower.includes("vimeo.com")
  );
}

/**
 * Creates a temporary signed download URL for files stored in a Private Supabase Bucket.
 * Default bucket: "invoices" (Private bucket)
 * Default validity: 60 minutes (3600 seconds)
 */
export async function getSignedInvoiceUrl(
  path: string,
  expiresInSeconds = 3600,
  bucket = "invoices"
): Promise<string> {
  const client = getSupabaseClient();
  const { data, error } = await client.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    console.error("Supabase Storage Signed URL Error:", error);
    throw new Error(error?.message || "Failed to generate signed URL for invoice");
  }

  return data.signedUrl;
}

/**
 * Uploads an order invoice file to the Private "invoices" Supabase Bucket.
 */
export async function uploadPrivateInvoice(
  orderNumber: string,
  fileContent: Blob | Buffer | File,
  bucket = "invoices"
): Promise<{ path: string; signedUrl: string }> {
  const filePath = `INVOICE-${orderNumber}.pdf`;
  const client = getSupabaseClient();

  const { data, error } = await client.storage
    .from(bucket)
    .upload(filePath, fileContent, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) {
    console.error("Supabase Private Invoice Upload Error:", error);
    throw new Error(error.message || "Failed to upload invoice to private bucket");
  }

  const signedUrl = await getSignedInvoiceUrl(data.path, 3600, bucket);

  return {
    path: data.path,
    signedUrl,
  };
}

export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif,image/avif";
export const ACCEPTED_VIDEO_TYPES = "video/mp4,video/webm,video/mov,video/quicktime";
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
