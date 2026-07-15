import type { Metadata } from "next";

import { HeroSection } from "@/components/home/hero-section";
import { FeaturesStrip } from "@/components/home/features-strip";
import { CategoriesGrid } from "@/components/home/categories-grid";
import { FeaturedProducts } from "@/components/home/featured-products";
import { NewArrivals } from "@/components/home/new-arrivals";
import { OffersBanner } from "@/components/home/offers-banner";
import { Testimonials } from "@/components/home/testimonials";
import { NewsletterSection } from "@/components/home/newsletter-section";

export const metadata: Metadata = {
  title: "Kesariya — Premium Indian Fashion | Handcrafted Clothing",
  description:
    "Discover premium handcrafted fashion at Kesariya. Shop our collection of shirts, kurtas, ethnic wear and more. Heritage woven into every thread.",
  keywords: [
    "Indian fashion",
    "handcrafted clothing",
    "premium shirts",
    "kurtas",
    "ethnic wear",
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
      <OffersBanner />
      <Testimonials />
      <NewsletterSection />
    </>
  );
}
