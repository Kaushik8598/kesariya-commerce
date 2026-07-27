"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [openSection, setOpenSection] = useState<string>("block-0");

  // Determine sections from product.contentBlocks or fallback to standard fields
  const hasBlocks = Array.isArray(product.contentBlocks) && product.contentBlocks.length > 0;

  const sections = hasBlocks
    ? (product.contentBlocks as any[])
        .map((b, i) => ({
          id: `block-${i}`,
          title: b.title || `Section ${i + 1}`,
          content: b.content || "",
        }))
        .filter((s) => s.content && String(s.content).trim() !== "")
    : [
        {
          id: "description",
          title: "Description",
          content: product.description || product.shortDescription || "",
        },
        {
          id: "details",
          title: "Details & Material",
          content: (
            <ul className="space-y-2 list-inside list-disc">
              {product.material && <li><strong>Material:</strong> {product.material}</li>}
              {product.weight && <li><strong>Weight:</strong> {product.weight}</li>}
              <li><strong>SKU:</strong> {product.sku}</li>
              {product.tags && product.tags.length > 0 && (
                <li><strong>Tags:</strong> {product.tags.join(", ")}</li>
              )}
            </ul>
          ),
        },
        {
          id: "care",
          title: "Care Instructions",
          content: product.careInstructions || "",
        },
      ].filter((s) => Boolean(s.content));

  if (sections.length === 0) return null;

  return (
    <div className="space-y-1">
      {sections.map((section, index) => {
        const isOpen = openSection === section.id;
        const isHtml = typeof section.content === "string";

        return (
          <div
            key={section.id}
            className={cn(
              "border-b border-border transition-colors",
              index === 0 && "border-t"
            )}
          >
            <Button
              variant="ghost"
              onClick={() => setOpenSection(isOpen ? "" : section.id)}
              className="flex w-full h-auto items-center justify-between py-5 px-0 text-left transition-colors hover:text-primary hover:bg-transparent rounded-none"
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
            </Button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                isOpen ? "max-h-[1000px] pb-5 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              {isHtml ? (
                <div
                  className="text-sm text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none [&_p]:mb-2.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_strong]:font-semibold [&_strong]:text-foreground [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_h3]:text-sm [&_h3]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: section.content as string }}
                />
              ) : (
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {section.content}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
