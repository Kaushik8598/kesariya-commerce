"use client";

import { useState, useMemo } from "react";
import { ShoppingBag, Loader2 } from "lucide-react";
import { VariantSelector } from "@/components/products/variant-selector";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import type { Product } from "@/types/product";
import { useAddToCart } from "@/hooks/cart/use-cart";
import { useMeasurements } from "@/hooks/measurement/use-measurement";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const { mutate: addToCart, isPending: isAdding } = useAddToCart();

  const { isAuthenticated } = useAuth();
  const { data: measurementProfiles } = useMeasurements();
  const defaultProfile = measurementProfiles?.find((p: any) => p.isDefault);
  const [selectedMeasurementId, setSelectedMeasurementId] = useState<string | null>(null);

  // Auto-select default profile when loaded
  useMemo(() => {
    if (defaultProfile && !selectedMeasurementId) {
      setSelectedMeasurementId(defaultProfile.id);
    }
  }, [defaultProfile, selectedMeasurementId]);

  // Check if product has variants
  const hasVariants = product.variants && product.variants.length > 0;

  // Find the selected variant to get accurate stock/price
  const selectedVariant = useMemo(() => {
    if (!hasVariants) return null;
    return product.variants.find(
      (v) => (!selectedSize || v.size === selectedSize) && (!selectedColor || v.color === selectedColor)
    );
  }, [product.variants, selectedSize, selectedColor, hasVariants]);

  // Validate selection
  const canAddToCart = useMemo(() => {
    if (!hasVariants) return product.stock > 0;

    const needsSize = product.variants.some((v) => v.size);
    const needsColor = product.variants.some((v) => v.color);

    if (needsSize && !selectedSize) return false;
    if (needsColor && !selectedColor) return false;
    if (product.isCustomizable && !selectedMeasurementId) return false;

    return selectedVariant ? selectedVariant.stock > 0 : false;
  }, [hasVariants, product.stock, product.variants, selectedSize, selectedColor, selectedVariant, product.isCustomizable, selectedMeasurementId]);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      variantId: selectedVariant?.id,
      quantity: 1,
      measurementProfileId: product.isCustomizable ? selectedMeasurementId || undefined : undefined,
    });
  };

  return (
    <div className="space-y-8">
      {hasVariants && (
        <VariantSelector
          variants={product.variants}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
          onSizeChange={setSelectedSize}
          onColorChange={setSelectedColor}
        />
      )}

      {/* Measurement Profile Selection */}
      {product.isCustomizable && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Select Fit Profile</h3>
            <Link href="/profile/measurements" className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">
              Manage Profiles
            </Link>
          </div>

          {!isAuthenticated ? (
            <div className="text-sm text-muted-foreground p-4 border border-border rounded-lg bg-secondary/10">
              Please <Link href="/login" className="text-primary hover:underline font-medium">login</Link> to select your measurement profile.
            </div>
          ) : !measurementProfiles || measurementProfiles.length === 0 ? (
            <div className="text-sm text-muted-foreground p-4 border border-border rounded-lg bg-secondary/10">
              You haven't added any measurement profiles yet. <br />
              <Link href="/profile/measurements" className="text-primary hover:underline font-medium block mt-1">Create one now</Link>
            </div>
          ) : (
            <Select
              value={selectedMeasurementId || ""}
              onValueChange={(val) => setSelectedMeasurementId(val as string)}
            >
              <SelectTrigger className="w-full h-12">
                <span className="truncate">
                  {selectedMeasurementId
                    ? measurementProfiles?.find((p: any) => p.id === selectedMeasurementId)
                      ? `${measurementProfiles.find((p: any) => p.id === selectedMeasurementId).name} ${measurementProfiles.find((p: any) => p.id === selectedMeasurementId).isDefault ? "(Default)" : ""}`
                      : "Select a measurement profile"
                    : "Select a measurement profile"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {measurementProfiles.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} {p.isDefault ? "(Default)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-4 pt-4 border-t border-border">
        <Button
          onClick={handleAddToCart}
          disabled={!canAddToCart || isAdding}
          className="flex-1 h-12 text-xs font-bold uppercase tracking-widest gap-2"
        >
          <ShoppingBag className="size-4" />
          {isAdding ? "Adding..." : !canAddToCart && hasVariants ? "Select Options" : product.stock === 0 ? "Out of Stock" : "Add to Bag"}
        </Button>
        <WishlistButton
          productId={product.id}
          className="size-12 rounded-xl border border-border bg-card hover:bg-secondary flex items-center justify-center shrink-0"
        />
      </div>

      {/* Stock Status */}
      <div className="text-xs font-medium">
        {!hasVariants ? (
          product.stock > 0 ? (
            <span className="text-emerald-500">In Stock ({product.stock} available)</span>
          ) : (
            <span className="text-destructive">Out of Stock</span>
          )
        ) : selectedVariant ? (
          selectedVariant.stock > 0 ? (
            <span className="text-emerald-500">In Stock ({selectedVariant.stock} available)</span>
          ) : (
            <span className="text-destructive">Out of Stock</span>
          )
        ) : (
          <span className="text-muted-foreground">Please select options to see availability</span>
        )}
      </div>
    </div>
  );
}
