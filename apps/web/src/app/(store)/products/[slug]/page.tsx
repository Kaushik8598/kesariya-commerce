import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { productService } from "@/services/product.service";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductBreadcrumb } from "@/components/products/product-breadcrumb";
import { ProductInfo } from "@/components/products/product-info";
import { ProductReviews } from "@/components/products/product-reviews";
import { RelatedProducts } from "@/components/products/related-products";
import { RatingStars } from "@/components/ui/rating-stars";
import { Price } from "@/components/ui/price";
import { ShoppingBag } from "lucide-react";
import { AddToCartButton } from "./add-to-cart-button"; // We will create this as a client component

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await productService.getProduct(slug);
    const product = res.data;
    return {
      title: `${product.name} | Kesariya`,
      description: product.shortDescription || product.description,
    };
  } catch (error) {
    return {
      title: "Product Not Found | Kesariya",
    };
  }
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  let product;
  try {
    const res = await productService.getProduct(slug);
    product = res.data;
  } catch (error) {
    notFound();
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductBreadcrumb product={product} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left Column: Images */}
          <div className="w-full">
            <Suspense fallback={<div className="aspect-[3/4] w-full rounded-2xl bg-secondary animate-pulse" />}>
              <ProductGallery images={product.images} productName={product.name} />
            </Suspense>
          </div>

          {/* Right Column: Product Details */}
          <div className="flex flex-col">
            {/* Header */}
            <div className="mb-8">
              {product.brand && (
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  {product.brand.name}
                </p>
              )}
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-6">
                <Price 
                  basePrice={product.basePrice} 
                  salePrice={product.salePrice}
                  className="text-2xl" 
                />
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <RatingStars rating={product.avgRating} count={0} />
                  <span className="text-xs font-medium text-muted-foreground underline underline-offset-4 cursor-pointer hover:text-primary">
                    {product._count?.reviews || 0} Reviews
                  </span>
                </div>
              </div>

              {product.shortDescription && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.shortDescription}
                </p>
              )}
            </div>

            {/* Client Component for Selection & Cart */}
            <div className="mb-10">
              <Suspense fallback={<div className="h-20 bg-secondary animate-pulse rounded-lg" />}>
                <AddToCartButton product={product} />
              </Suspense>
            </div>

            {/* Product Information Accordion */}
            <ProductInfo product={product} />
            
            {/* Reviews Section */}
            <ProductReviews slug={product.slug} />
          </div>
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts slug={product.slug} categorySlug={product.category?.slug} />
    </>
  );
}
