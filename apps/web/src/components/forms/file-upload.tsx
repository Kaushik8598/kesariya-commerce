"use client";

import React, { useState, useRef } from "react";
import { Upload, X, File } from "lucide-react";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FileUploadProps {
  onChange: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSizeMb?: number;
  label?: string;
}

export function FileUpload({
  onChange,
  multiple = false,
  accept = "image/*",
  maxSizeMb = 5,
  label,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{ file: File; previewUrl?: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (filesList: FileList) => {
    const validFiles: { file: File; previewUrl?: string }[] = [];
    const maxSizeBytes = maxSizeMb * 1024 * 1024;

    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];

      if (file.size > maxSizeBytes) {
        toast.error(`File ${file.name} exceeds the max size of ${maxSizeMb}MB`);
        continue;
      }

      const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
      validFiles.push({ file, previewUrl });

      if (!multiple) break; // If single upload, only process the first one
    }

    if (validFiles.length > 0) {
      const updatedFiles = multiple ? [...selectedFiles, ...validFiles] : validFiles;
      setSelectedFiles(updatedFiles);
      onChange(updatedFiles.map((f) => f.file));
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
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    const fileToRemove = selectedFiles[index];
    if (fileToRemove.previewUrl) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }
    const updatedFiles = selectedFiles.filter((_, idx) => idx !== index);
    setSelectedFiles(updatedFiles);
    onChange(updatedFiles.map((f) => f.file));
  };

  return (
    <div className="flex flex-col gap-1.5 w-full text-left">
      {label && (
        <Label className="text-xs font-extrabold tracking-widest text-foreground/75 uppercase">
          {label}
        </Label>
      )}

      {/* Dropzone frame */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${dragActive
            ? "border-primary bg-primary/5"
            : "border-border bg-card/50 hover:bg-secondary hover:border-foreground/30"
          }`}
      >
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="p-3 rounded-full bg-secondary/80 text-foreground/60 mb-2">
          <Upload className="h-6 w-6" />
        </div>

        <p className="text-xs font-bold tracking-wider uppercase text-foreground">
          Drag & Drop or Click to Upload
        </p>
        <p className="text-[10px] font-semibold text-foreground/40 mt-1 uppercase tracking-wide">
          Supported files: {accept.replace("/*", "")} up to {maxSizeMb}MB
        </p>
      </div>

      {/* Previews section */}
      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          {selectedFiles.map((item, idx) => (
            <div
              key={idx}
              className="relative group border border-border bg-card p-1.5 rounded-md flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-200"
            >
              {item.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="h-20 w-full object-cover rounded-sm mb-1.5"
                />
              ) : (
                <div className="h-20 w-full flex items-center justify-center bg-secondary/50 rounded-sm mb-1.5 text-foreground/40">
                  <File className="h-8 w-8" />
                </div>
              )}
              <p className="text-[9px] font-semibold tracking-wide text-foreground truncate w-full px-1 uppercase">
                {item.file.name}
              </p>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(idx);
                }}
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-foreground text-background hover:bg-primary hover:text-primary-foreground opacity-90 transition-all shadow-sm border-none"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
