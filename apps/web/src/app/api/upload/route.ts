import { NextRequest } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-storage";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "products";
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return errorResponse("No file provided for upload");
    }

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return errorResponse(
        "Supabase API key is missing. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY in your .env / .env.local file from your Supabase Dashboard."
      );
    }

    const cleanName = file.name ? file.name.replace(/[^a-zA-Z0-9.-]/g, "_") : "file";
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}-${randomStr}-${cleanName}`;
    const filePath = `${folder}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type || "application/octet-stream",
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Supabase Storage Upload Error:", error);
      if (error.message?.includes("row-level security policy")) {
        return errorResponse(
          "Supabase Storage Policy Error: RLS is active on '" + bucket + "' bucket. Please add a Storage Policy in Supabase Dashboard (Storage -> Buckets -> " + bucket + " -> Policies) or set SUPABASE_SERVICE_ROLE_KEY in .env file."
        );
      }
      if (error.message?.includes("base64url decode the signature")) {
        return errorResponse(
          "Invalid Supabase Key. Please paste your valid key from Supabase Dashboard (Project Settings -> API) into your .env / .env.local file."
        );
      }
      return errorResponse(error.message || "Failed to upload file to Supabase Storage");
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return successResponse({
      url: publicUrlData.publicUrl,
      path: data.path,
      bucket,
      folder,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return serverErrorResponse(error?.message || "File upload to Supabase Storage failed");
  }
}
