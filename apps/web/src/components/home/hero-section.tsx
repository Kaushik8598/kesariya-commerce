"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=2000&auto=format&fit=crop",
    badge: "MEN'S SHIRT COLLECTION 2026",
    titleLine1: "Precision Tailored",
    titleHighlight: "Linen & Printed Shirts",
    subtitle: "Crafted from 100% pure linen and organic cotton prints. Experience unmatched breathability, comfort & royal style.",
    primaryCta: { label: "Shop Men's Shirts", href: "/products" },
    secondaryCta: { label: "New Arrivals", href: "/products?sort=newest" },
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=2000&auto=format&fit=crop",
    badge: "HANDCRAFTED MEN'S WEAR",
    titleLine1: "Earthy Luxury",
    titleHighlight: "In Every Thread",
    subtitle: "Hand-printed block patterns, mandarin collars, and refined tailoring designed for modern gentlemen.",
    primaryCta: { label: "Explore Shirts", href: "/products" },
    secondaryCta: { label: "Custom Fit Profile", href: "/profile/measurements" },
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=2000&auto=format&fit=crop",
    badge: "PREMIUM LINEN & COTTON",
    titleLine1: "Effortless Elegance",
    titleHighlight: "For Every Occasion",
    subtitle: "From casual weekend retreats to refined evening gatherings, discover your signature men's shirt fit.",
    primaryCta: { label: "View Best Sellers", href: "/products" },
    secondaryCta: { label: "Tailoring Guide", href: "/profile/measurements" },
  },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-zinc-950 text-white">
      {/* Wide Landscape Background Image Carousel Slides */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === current ? "opacity-100 z-0" : "opacity-0 z-0 pointer-events-none"
            }`}
        >
          <Image
            src={slide.image}
            alt={slide.titleLine1}
            fill
            priority={idx === 0}
            sizes="100vw"
            className="object-cover object-center scale-105 transition-transform duration-10000 ease-linear"
          />
          {/* Dual Overlay Gradients for Perfect Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/40" />
        </div>
      ))}

      {/* Decorative Orbs */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[140px] animate-pulse-soft" />
        <div className="absolute -bottom-40 -left-20 h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-[120px] animate-pulse-soft animation-delay-2000" />
      </div>

      {/* Main Content Box */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="max-w-4xl space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 backdrop-blur-md">
            <Sparkles className="size-3.5 text-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/90 font-mono">
              {slides[current].badge}
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl font-heading">
            {slides[current].titleLine1}
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-500 to-primary bg-clip-text text-transparent">
              {slides[current].titleHighlight}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg font-medium">
            {slides[current].subtitle}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href={slides[current].primaryCta.href}
              className="group inline-flex items-center gap-2.5 rounded-full bg-primary px-8 py-4 text-xs font-extrabold uppercase tracking-[0.2em] text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30"
            >
              {slides[current].primaryCta.label}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href={slides[current].secondaryCta.href}
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/20 bg-black/30 backdrop-blur-md px-8 py-4 text-xs font-extrabold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:border-white/50 hover:bg-white/10"
            >
              {slides[current].secondaryCta.label}
            </Link>
          </div>

          {/* Stats Section */}
          <div className="flex items-center gap-10 border-t border-white/15 pt-8 sm:gap-16">
            {[
              { value: "100%", label: "Pure Linen & Cotton" },
              { value: "10K+", label: "Happy Men" },
              { value: "4.9★", label: "Average Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-extrabold text-white sm:text-3xl font-heading">
                  {stat.value}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Carousel Controls & Indicators (Bottom Right) */}
      <div className="absolute right-6 bottom-12 z-30 flex items-center gap-4 sm:right-12">
        {/* Slide Dots */}
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`h-2.5 rounded-full transition-all duration-500 focus:outline-none ${i === current
                ? "w-8 bg-amber-400"
                : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
              aria-label={`Go to hero slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Prev / Next Arrows */}
        <div className="flex items-center gap-2 ml-2">
          <button
            type="button"
            onClick={prevSlide}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-white hover:text-black focus:outline-none"
            aria-label="Previous hero slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-white hover:text-black focus:outline-none"
            aria-label="Next hero slide"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Bottom Gradient Fade to Store Front */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
}
