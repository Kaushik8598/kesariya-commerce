import type { Metadata } from "next";

import { HeroSection } from "@/components/home/hero-section";
import { FeaturesStrip } from "@/components/home/features-strip";
import { CategoriesGrid } from "@/components/home/categories-grid";
import { FeaturedProducts } from "@/components/home/featured-products";
import { NewArrivals } from "@/components/home/new-arrivals";
import { MiddleBannerCarousel } from "@/components/home/middle-banner-carousel";
import { OffersBanner } from "@/components/home/offers-banner";
import { Testimonials } from "@/components/home/testimonials";

export const metadata: Metadata = {
  title: "Kesariya — Premium Men's Linen & Handcrafted Shirts",
  description:
    "Discover premium handcrafted men's shirts at Kesariya. Shop our collection of pure linen, cotton block prints, and refined apparel.",
  keywords: [
    "Men's shirts",
    "linen shirts",
    "handcrafted clothing",
    "block print shirts",
    "ethnic menswear",
    "Kesariya",
  ],
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesStrip />
      <CategoriesGrid />
      <FeaturedProducts />
      <NewArrivals />
      <MiddleBannerCarousel />
      <OffersBanner />
      <Testimonials />
    </>
  );
}
