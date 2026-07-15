import { Suspense } from "react";
import { ProductGrid } from "@/components/products/product-grid";

export const metadata = {
  title: "Search Results | Kesariya",
  description: "Search for products across Kesariya's premium collections.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = params.q as string | undefined;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-border pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {query ? `Search results for "${query}"` : "Search Products"}
          </h1>
          {query && (
            <p className="mt-2 text-sm text-muted-foreground">
              Explore our collection matching your search criteria.
            </p>
          )}
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          }
        >
          <ProductGrid />
        </Suspense>
      </div>
    </main>
  );
}
