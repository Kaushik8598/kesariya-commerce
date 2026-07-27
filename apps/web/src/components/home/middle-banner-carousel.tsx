"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=2000&auto=format&fit=crop",
    badge: "HAND-BLOCK PRINTED SHIRTS",
    titleLine1: "Artisan Jaipur Prints",
    titleHighlight: "For Modern Gentlemen",
    subtitle: "Pure organic cottons dyed with natural pigments and artisan hand-carved woodblock prints.",
    href: "/products",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2000&auto=format&fit=crop",
    badge: "ROYAL LINEN COLLECTION",
    titleLine1: "Refined Casuals & Evening Fits",
    titleHighlight: "Crafted To Perfection",
    subtitle: "Lightweight French linen weaves featuring spread & mandarin collars. Ideal for warm climate luxury.",
    href: "/products",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=2000&auto=format&fit=crop",
    badge: "CUSTOM TAILORED FIT",
    titleLine1: "Woven For Your Unique",
    titleHighlight: "Individual Silhouette",
    subtitle: "Create your personalized measurement profile for custom sleeve lengths, shoulder widths & perfect waist fits.",
    href: "/profile/measurements",
  },
];

export function MiddleBannerCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const prevSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrent(index);
  };

  return (
    <section className="relative my-16 w-full flex min-h-[85vh] sm:min-h-[90vh] items-center overflow-hidden bg-zinc-950 text-white rounded-none border-none group cursor-pointer">
      {/* Clickable Slide Wrapper (Clicking anywhere redirects to target link) */}
      <Link href={slides[current].href} className="absolute inset-0 block z-0 focus:outline-none">
        {/* Full Screen Height Background Image Carousel Slides */}
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === current ? "opacity-100 z-0" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.titleLine1}
              fill
              sizes="100vw"
              className="object-cover object-center scale-105 transition-transform duration-10000 ease-linear"
            />
            {/* Rich Dual Gradients for Perfect Contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
          </div>
        ))}
      </Link>

      {/* Decorative Glow Orbs */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[140px] animate-pulse-soft" />
        <div className="absolute -bottom-40 -left-20 h-[400px] w-[400px] rounded-full bg-amber-500/15 blur-[120px] animate-pulse-soft animation-delay-2000" />
      </div>

      {/* Content Overlay Box (Clicking text also triggers redirect) */}
      <Link href={slides[current].href} className="relative z-20 mx-auto w-full max-w-7xl px-6 py-24 sm:px-12 lg:px-16 block text-left">
        <div className="max-w-3xl space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 backdrop-blur-md">
            <Sparkles className="size-3.5 text-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/90 font-mono">
              {slides[current].badge}
            </span>
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl font-heading">
            {slides[current].titleLine1}
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-500 to-primary bg-clip-text text-transparent">
              {slides[current].titleHighlight}
            </span>
          </h2>

          {/* Subtitle */}
          <p className="max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg font-medium">
            {slides[current].subtitle}
          </p>
        </div>
      </Link>

      {/* Carousel Controls & Indicators (Bottom Right - Stops link propagation) */}
      <div className="absolute right-8 bottom-12 z-30 flex items-center gap-4 sm:right-12">
        {/* Slide Dots */}
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => handleDotClick(e, i)}
              className={`h-2.5 rounded-full transition-all duration-500 focus:outline-none ${
                i === current
                  ? "w-8 bg-amber-400 shadow-md shadow-amber-400/50"
                  : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Prev / Next Arrows */}
        <div className="flex items-center gap-2 ml-2">
          <button
            type="button"
            onClick={prevSlide}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-white hover:text-black focus:outline-none"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-white hover:text-black focus:outline-none"
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
