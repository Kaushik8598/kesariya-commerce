/**
 * Direct browser image uploader utility.
 * Supports Cloudinary direct unsigned upload if configured, with instant Base64 fallback.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

export async function uploadImageFile(file: File): Promise<string> {
  // If Cloudinary credentials exist, upload directly
  if (CLOUD_NAME && UPLOAD_PRESET) {
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "kesariya/avatars");

    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      return data.secure_url || data.url;
    }
  }

  // Fallback: Convert to Base64 data URL for instant display & storing
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
