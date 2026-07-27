"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Trash2, Loader2, Upload, User, Crop } from "lucide-react";
import { toast } from "sonner";
import { uploadImageFile } from "@/lib/cloudinary";
import { ImageCropModal } from "./image-crop-modal";

interface ProfileAvatarUploaderProps {
  avatarUrl?: string | null;
  onChangeAvatar: (url: string | null) => void;
  userName?: string;
  disabled?: boolean;
}

export function ProfileAvatarUploader({
  avatarUrl,
  onChangeAvatar,
  userName,
  disabled = false,
}: ProfileAvatarUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Avatar image size must be under 10MB");
      return;
    }

    // Read image as Data URL to pass to Crop Modal
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSelectedImageSrc(reader.result);
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCroppedFileComplete = async (croppedFile: File) => {
    try {
      setIsUploading(true);
      const uploadedUrl = await uploadImageFile(croppedFile);
      onChangeAvatar(uploadedUrl);
      setIsUploading(false);
      toast.info("Image cropped & uploaded! Click 'Save Changes' to update your profile.");
    } catch (err: any) {
      setIsUploading(false);
      toast.error("Failed to upload avatar image");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveAvatar = () => {
    onChangeAvatar(null);
    toast.info("Avatar removed. Click 'Save Changes' to apply.");
  };

  const isBusy = isUploading || disabled;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
            e.target.value = ""; // Reset input so same file can be selected again
          }
        }}
      />

      {/* Image Crop Modal */}
      {selectedImageSrc && (
        <ImageCropModal
          isOpen={cropModalOpen}
          onClose={() => setCropModalOpen(false)}
          imageSrc={selectedImageSrc}
          onCropComplete={handleCroppedFileComplete}
        />
      )}

      {/* Round Drag & Drop Avatar Circle Container */}
      <div className="relative group cursor-pointer">
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isBusy && fileInputRef.current?.click()}
          className={`relative h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden border-2 transition-all duration-300 shadow-md ${
            dragActive
              ? "border-primary ring-4 ring-primary/30 scale-105"
              : "border-border ring-4 ring-primary/10 hover:ring-primary/30 hover:border-primary"
          }`}
        >
          {/* Avatar Image or Default Icon */}
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={userName || "User Avatar"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="h-full w-full bg-secondary flex items-center justify-center text-muted-foreground">
              <User className="h-12 w-12 opacity-60" />
            </div>
          )}

          {/* Hover / Drag Overlay */}
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white transition-opacity duration-200 ${
              dragActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            {isBusy ? (
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            ) : dragActive ? (
              <>
                <Upload className="h-6 w-6 text-primary animate-bounce mb-1" />
                <span className="text-[10px] font-black uppercase tracking-wider text-white">
                  Drop Here
                </span>
              </>
            ) : (
              <>
                <Crop className="h-6 w-6 mb-1 text-white/90" />
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/90">
                  {avatarUrl ? "Crop & Change" : "Crop & Upload"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Small Camera Quick Upload Badge */}
        <button
          type="button"
          onClick={() => !isBusy && fileInputRef.current?.click()}
          disabled={isBusy}
          className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md border-2 border-background transition-transform hover:scale-110 cursor-pointer"
          title="Upload & Crop Picture"
        >
          <Camera className="h-4 w-4" />
        </button>
      </div>

      {/* Action Buttons & Drag Hint */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isBusy}
          className="text-[11px] font-extrabold uppercase tracking-wider text-primary hover:underline"
        >
          Drag & Drop or Upload
        </button>
        {avatarUrl && (
          <>
            <span className="text-muted-foreground/40">•</span>
            <button
              type="button"
              onClick={handleRemoveAvatar}
              disabled={isBusy}
              className="text-[11px] font-bold uppercase tracking-wider text-destructive hover:underline flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" /> Remove
            </button>
          </>
        )}
      </div>
    </div>
  );
}
