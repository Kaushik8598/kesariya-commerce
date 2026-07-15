"use client";

import { useState, useMemo } from "react";
import { ShoppingBag, Loader2 } from "lucide-react";
import { VariantSelector } from "@/components/products/variant-selector";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import type { Product } from "@/types/product";
import { useAddToCart } from "@/hooks/cart/use-cart";

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  
  const { mutate: addToCart, isPending: isAdding } = useAddToCart();

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

    return selectedVariant ? selectedVariant.stock > 0 : false;
  }, [hasVariants, product.stock, product.variants, selectedSize, selectedColor, selectedVariant]);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      variantId: selectedVariant?.id,
      quantity: 1,
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
