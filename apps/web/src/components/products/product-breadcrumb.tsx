import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Product } from "@/types/product";

interface ProductBreadcrumbProps {
  product: Product;
}

export function ProductBreadcrumb({ product }: ProductBreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-xs text-muted-foreground mt-8 mb-6">
      <Link href="/" className="hover:text-primary transition-colors">
        Home
      </Link>
      <ChevronRight className="size-3" />
      <Link href="/products" className="hover:text-primary transition-colors">
        Products
      </Link>
      <ChevronRight className="size-3" />
      {product.category && (
        <>
          <Link
            href={`/category/${product.category.slug}`}
            className="hover:text-primary transition-colors"
          >
            {product.category.name}
          </Link>
          <ChevronRight className="size-3" />
        </>
      )}
      <span className="text-foreground font-medium line-clamp-1">
        {product.name}
      </span>
    </nav>
  );
}
