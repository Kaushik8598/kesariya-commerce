"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import type { ProductImage } from "@/types/product";

interface ProductGalleryProps {
  images: ProductImage[];
  videoUrl?: string | null;
  productName: string;
}

function isVideoUrl(url: string): boolean {
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

export function ProductGallery({ images, videoUrl, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchParams = useSearchParams();
  const selectedColor = searchParams.get("color");

  // 1. Build unified media items array combining images + videoUrl
  const allMediaItems = useMemo(() => {
    const items: ProductImage[] = [...(images || [])];
    if (videoUrl && !items.some((m) => m.url === videoUrl)) {
      items.push({
        id: "product-video-main",
        productId: "",
        url: videoUrl,
        publicId: null,
        alt: `${productName} Video`,
        sortOrder: 999,
        isPrimary: false,
      });
    }
    return items;
  }, [images, videoUrl, productName]);

  // 2. Filter media items based on selectedColor if a color is selected
  const mediaItems = useMemo(() => {
    if (!selectedColor || !selectedColor.trim()) return allMediaItems;

    const lowerSelected = selectedColor.trim().toLowerCase();

    // Find items explicitly tagged with the selected color or matching alt text
    const colorSpecificItems = allMediaItems.filter(
      (img) =>
        (img.color && img.color.trim().toLowerCase() === lowerSelected) ||
        (img.alt && img.alt.toLowerCase().includes(lowerSelected))
    );

    // If there are images matching this color, show color-specific items + general items (un-tagged color)
    if (colorSpecificItems.length > 0) {
      const generalItems = allMediaItems.filter(
        (img) => !img.color || img.color.trim() === ""
      );
      const combined = [
        ...colorSpecificItems,
        ...generalItems.filter((g) => !colorSpecificItems.some((c) => c.url === g.url)),
      ];
      return combined.length > 0 ? combined : allMediaItems;
    }

    return allMediaItems;
  }, [allMediaItems, selectedColor]);

  // Reset selectedIndex to 0 whenever color selection changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [selectedColor]);

  if (!mediaItems || mediaItems.length === 0) {
    return (
      <div className="aspect-[3/4] w-full rounded-2xl bg-secondary flex items-center justify-center">
        <span className="text-muted-foreground text-sm uppercase tracking-widest">No Media</span>
      </div>
    );
  }

  const currentMedia = mediaItems[selectedIndex] || mediaItems[0];
  const isCurrentVideo = isVideoUrl(currentMedia?.url);

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6 lg:h-[800px]">
      {/* Thumbnails */}
      <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto no-scrollbar pb-2 lg:pb-0 shrink-0">
        {mediaItems.map((item, index) => {
          const isVid = isVideoUrl(item.url);

          return (
            <Button
              variant="ghost"
              key={item.id || index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative size-20 sm:size-24 lg:size-28 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 p-0 h-auto hover:bg-transparent bg-secondary",
                selectedIndex === index
                  ? "border-primary shadow-md opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              {isVid ? (
                <div className="relative h-full w-full bg-slate-950 flex items-center justify-center">
                  <video
                    src={item.url}
                    className="h-full w-full object-cover opacity-70"
                    muted
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/90 text-white shadow-md">
                      <Play size={12} className="ml-0.5" fill="currentColor" />
                    </span>
                  </div>
                  <span className="absolute left-1 top-1 rounded bg-violet-600 px-1.5 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider">
                    VIDEO
                  </span>
                </div>
              ) : (
                <Image
                  src={item.url}
                  alt={item.alt || `${productName} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              )}
            </Button>
          );
        })}
      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 overflow-hidden rounded-2xl bg-secondary aspect-[3/4] lg:aspect-auto flex items-center justify-center">
        {isCurrentVideo ? (
          <div className="relative h-full w-full bg-black flex items-center justify-center">
            <video
              key={currentMedia.url}
              src={currentMedia.url}
              controls
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <Image
            src={currentMedia.url}
            alt={currentMedia.alt || `${productName} image ${selectedIndex + 1}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 ease-out hover:scale-120"
          />
        )}
      </div>
    </div>
  );
}
