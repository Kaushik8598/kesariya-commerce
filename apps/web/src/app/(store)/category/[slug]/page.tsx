import { Metadata } from "next";
import { Suspense } from "react";
import { ProductGrid } from "@/components/products/product-grid";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Category | Kesariya",
  description: "Browse our premium handcrafted clothing for this category.",
};

function ProductGridFallback() {
  return (
    <div className="flex flex-col md:flex-row gap-8 items-start relative">
      <div className="w-full md:w-64 shrink-0 hidden md:block">
        <Skeleton className="h-[400px] w-full" />
      </div>
      <div className="flex-1 w-full min-w-0 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[3/4] w-full rounded-xl" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-12 border-b border-border pb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl capitalize">
          {slug.replace(/-/g, " ")}
        </h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">
          Discover our curated collection of premium {slug.replace(/-/g, " ")}.
        </p>
      </div>

      <Suspense fallback={<ProductGridFallback />}>
        <ProductGrid categorySlug={slug} />
      </Suspense>
    </div>
  );
}
