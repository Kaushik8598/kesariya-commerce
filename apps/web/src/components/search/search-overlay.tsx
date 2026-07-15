"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useProducts } from "@/hooks/products/use-products";
import { formatPrice } from "@/components/ui/price";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, loading } = useProducts(
    debouncedQuery.trim() ? { q: debouncedQuery.trim(), limit: 5 } : undefined
  );

  const products = data?.products || [];
  const total = data?.pagination?.total || 0;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="mx-auto w-full max-w-4xl flex-1 flex flex-col p-4 sm:p-6 md:p-8 mt-10 md:mt-20">
        <div className="flex items-center justify-between gap-4 border-b-2 border-foreground/10 pb-4 focus-within:border-primary transition-colors">
          <Search className="h-6 w-6 text-foreground/50" />
          <form onSubmit={handleSubmit} className="flex-1">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for products, categories..."
              className="w-full bg-transparent text-xl sm:text-2xl md:text-3xl font-light outline-none placeholder:text-foreground/30"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-foreground/5 transition-colors cursor-pointer group"
          >
            <X className="h-6 w-6 text-foreground/50 group-hover:text-foreground transition-colors" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mt-8 pb-10">
          {debouncedQuery.trim() === "" ? (
            <div className="text-center text-foreground/40 mt-20">
              <p className="text-lg">Start typing to search...</p>
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                <span className="text-xs uppercase tracking-widest font-bold">Trending:</span>
                {["Shirts", "Kurtas", "Linen", "Denim"].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="text-xs uppercase tracking-widest hover:text-primary transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-bottom-4 duration-500 fade-in">
              {loading && products.length === 0 ? (
                <div className="flex justify-center mt-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : products.length > 0 ? (
                <div className="space-y-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground/50">
                    Products
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={onClose}
                        className="group flex gap-4 p-3 -m-3 rounded-xl hover:bg-foreground/5 transition-colors"
                      >
                        <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-foreground/20 text-xs">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center flex-1 min-w-0">
                          <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                            {product.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {product.category?.name}
                          </p>
                          <div className="mt-2 flex items-center gap-2 text-sm font-medium">
                            <span>{formatPrice(product.salePrice || product.basePrice)}</span>
                            {product.salePrice && (
                              <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(product.basePrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {total > 5 && (
                    <div className="pt-6 mt-6 border-t border-border flex justify-center">
                      <Link
                        href={`/search?q=${encodeURIComponent(debouncedQuery)}`}
                        onClick={onClose}
                        className="group flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-primary hover:text-primary/80 transition-colors"
                      >
                        View all {total} results
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center mt-20">
                  <p className="text-lg text-foreground/70">No results found for "{debouncedQuery}"</p>
                  <p className="text-sm text-foreground/40 mt-2">Try checking for typos or using broader terms.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
