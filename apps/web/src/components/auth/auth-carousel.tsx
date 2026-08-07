"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1200&auto=format&fit=crop",
    title: "Wear Confidence. Wear Kesariya.",
    subtitle: "Discover luxury men's shirts crafted with 100% pure linen, organic cotton prints, and royal elegance.",
    badge: "MEN'S SHIRT COLLECTION",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1200&auto=format&fit=crop",
    title: "Earthy Luxury & Craftsmanship",
    subtitle: "Hand-printed block patterns and mandarin collar shirts designed for modern gentlemen.",
    badge: "HANDCRAFTED SHIRTS",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?q=80&w=1200&auto=format&fit=crop",
    title: "Unmatched Regal Couture",
    subtitle: "Experience seamless shopping with custom fit profiling, fast shipping, and curated men's shirt styles.",
    badge: "EXCLUSIVE DESIGNS",
  },
];

export function AuthCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative hidden h-full w-full overflow-hidden bg-zinc-950 lg:flex lg:flex-col lg:justify-between p-12 text-white">
      {/* Background Image Carousel with Fade Animation */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === current ? "opacity-100 z-0" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={idx === 0}
            sizes="50vw"
            className="object-cover object-center scale-105 transition-transform duration-10000 ease-linear"
          />
          {/* Dark Gradients for Crisp Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60" />
        </div>
      ))}

      {/* Top Bar: Logo Component */}
      <div className="relative z-10 flex items-center justify-between">
        <Logo size="md" showBadge showSubtitle textClassName="text-white" />
      </div>

      {/* Bottom Content Overlay */}
      <div className="relative z-10 max-w-lg space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
          <Sparkles size={12} className="text-amber-400" />
          {slides[current].badge}
        </div>

        {/* Dynamic Title & Subtitle */}
        <div className="space-y-3">
          <h2 className="text-4xl font-extrabold leading-tight text-white font-heading tracking-tight sm:text-5xl">
            {slides[current].title}
          </h2>
          <p className="text-sm font-medium leading-relaxed text-zinc-300">
            {slides[current].subtitle}
          </p>
        </div>

        {/* Slide Indicators & Arrow Controls */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-500 focus:outline-none ${
                  i === current
                    ? "w-8 bg-amber-400"
                    : "w-2 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevSlide}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-white hover:text-black"
              aria-label="Previous slide"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-white hover:text-black"
              aria-label="Next slide"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
