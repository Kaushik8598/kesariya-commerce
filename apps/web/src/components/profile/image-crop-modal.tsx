"use client";

import { useState, useRef, useEffect } from "react";
import { ZoomIn, ZoomOut, Check, X, RotateCcw, Crop } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedFile: File) => void;
}

export function ImageCropModal({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
}: ImageCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const cropCircleRef = useRef<HTMLDivElement>(null);

  // Reset controls when a new image is loaded
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleCrop = () => {
    if (!imgRef.current || !containerRef.current || !cropCircleRef.current) return;

    const cropCircleRect = cropCircleRef.current.getBoundingClientRect();
    const imgRect = imgRef.current.getBoundingClientRect();

    const naturalWidth = imgRef.current.naturalWidth;
    const naturalHeight = imgRef.current.naturalHeight;

    // Scale factors: screen pixels to natural image pixels
    const scaleX = naturalWidth / imgRect.width;
    const scaleY = naturalHeight / imgRect.height;

    // Calculate crop origin and dimensions relative to natural image
    const sourceX = (cropCircleRect.left - imgRect.left) * scaleX;
    const sourceY = (cropCircleRect.top - imgRect.top) * scaleY;
    const sourceWidth = cropCircleRect.width * scaleX;
    const sourceHeight = cropCircleRect.height * scaleY;

    const outputSize = 400; // Output 400x400 high quality avatar
    const canvas = document.createElement("canvas");
    canvas.width = outputSize;
    canvas.height = outputSize;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outputSize, outputSize);

    // Apply circular clipping path
    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(
      imgRef.current,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      outputSize,
      outputSize
    );

    // Convert Canvas to Blob File
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const croppedFile = new File([blob], "avatar-cropped.png", {
            type: "image/png",
          });
          onCropComplete(croppedFile);
          onClose();
        }
      },
      "image/png",
      0.95
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-extrabold uppercase tracking-wider font-heading">
            <Crop className="h-5 w-5 text-primary" /> Crop Profile Picture
          </DialogTitle>
        </DialogHeader>

        {/* Cropper Viewport */}
        <div className="flex flex-col items-center gap-4 py-2">
          <p className="text-xs text-muted-foreground text-center">
            Drag to position your face and zoom in/out for a perfect circular fit.
          </p>

          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            className="relative h-72 w-72 rounded-2xl bg-black/90 overflow-hidden cursor-grab active:cursor-grabbing border border-border select-none touch-none flex items-center justify-center shadow-inner"
          >
            {/* Image Preview with Zoom and Offset */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop target"
              draggable={false}
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                maxHeight: "100%",
                maxWidth: "100%",
                objectFit: "contain",
                transition: isDragging ? "none" : "transform 0.1s ease-out",
              }}
              className="pointer-events-none"
            />

            {/* Circular Mask Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div
                ref={cropCircleRef}
                className="h-60 w-60 rounded-full border-2 border-primary ring-4 ring-primary/30 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
              />
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="w-full flex items-center gap-3 px-4 pt-2">
            <ZoomOut className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="range"
              min="1"
              max="3.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                setZoom(1);
                setOffset({ x: 0, y: 0 });
              }}
              className="h-8 w-8 ml-2 shrink-0 text-muted-foreground hover:text-foreground"
              title="Reset Position"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs font-bold uppercase tracking-wider"
          >
            <X className="h-4 w-4 mr-1" /> Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCrop}
            className="text-xs font-bold uppercase tracking-wider gap-1.5"
          >
            <Check className="h-4 w-4" /> Apply & Save Picture
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
