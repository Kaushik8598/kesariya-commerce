"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [openSection, setOpenSection] = useState<string>("description");

  const sections = [
    {
      id: "description",
      title: "Description",
      content: product.description,
    },
    {
      id: "details",
      title: "Details & Material",
      content: (
        <ul className="space-y-2 list-inside list-disc">
          {product.material && <li><strong>Material:</strong> {product.material}</li>}
          {product.weight && <li><strong>Weight:</strong> {product.weight}</li>}
          <li><strong>SKU:</strong> {product.sku}</li>
          {product.tags.length > 0 && (
            <li><strong>Tags:</strong> {product.tags.join(", ")}</li>
          )}
        </ul>
      ),
    },
    {
      id: "care",
      title: "Care Instructions",
      content: product.careInstructions,
    },
  ].filter((s) => s.content);

  if (sections.length === 0) return null;

  return (
    <div className="space-y-1">
      {sections.map((section, index) => {
        const isOpen = openSection === section.id;
        
        return (
          <div
            key={section.id}
            className={cn(
              "border-b border-border transition-colors",
              index === 0 && "border-t"
            )}
          >
            <button
              onClick={() => setOpenSection(isOpen ? "" : section.id)}
              className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-primary"
            >
              <span className="text-xs font-bold uppercase tracking-widest">
                {section.title}
              </span>
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-300",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                isOpen ? "max-h-96 pb-5 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert">
                {section.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
