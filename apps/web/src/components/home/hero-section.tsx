"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-gradient-to-br from-[#2C1810] via-[#3E2723] to-[#1B1311]">
      {/* Decorative Background Elements */}
      <div className="pointer-events-none absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary/15 blur-[120px] animate-pulse-soft" />
        <div className="absolute -bottom-40 -left-20 h-[400px] w-[400px] rounded-full bg-[#E8A87C]/10 blur-[100px] animate-pulse-soft animation-delay-2000" />
        <div className="absolute right-1/4 top-1/3 h-[300px] w-[300px] rounded-full bg-primary/8 blur-[80px] animate-float" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Diagonal decorative line */}
        <div className="absolute -right-20 top-0 h-full w-px rotate-[25deg] bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute right-40 top-0 h-full w-px rotate-[25deg] bg-gradient-to-b from-transparent via-white/[0.04] to-transparent" />
      </div>

      {/* Content */}
      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Collection Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 backdrop-blur-sm">
            <Sparkles className="size-3.5 text-[#E8A87C]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">
              Summer Collection 2026
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="animate-fade-in-up animation-delay-200 mt-8 text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Heritage Woven
            <br />
            <span className="bg-gradient-to-r from-[#E8A87C] via-[#D24343] to-[#E8A87C] bg-clip-text text-transparent">
              Into Every Thread
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-up animation-delay-400 mt-6 max-w-xl text-base leading-relaxed text-white/50 sm:text-lg">
            Premium handcrafted fashion that blends traditional Indian
            craftsmanship with contemporary design. Discover your signature
            style.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up animation-delay-600 mt-10 flex flex-wrap gap-4">
            <Link
              href="/products"
              className="group inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-xs font-extrabold uppercase tracking-[0.2em] text-[#3E2723] transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/25"
            >
              Shop Collection
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/products?sort=newest"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/15 px-8 py-4 text-xs font-extrabold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:border-white/30 hover:bg-white/5"
            >
              New Arrivals
            </Link>
          </div>

          {/* Stats */}
          <div className="animate-fade-in-up animation-delay-800 mt-16 flex gap-10 border-t border-white/[0.06] pt-8 sm:gap-16">
            {[
              { value: "500+", label: "Products" },
              { value: "10K+", label: "Happy Customers" },
              { value: "4.8★", label: "Average Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-extrabold text-white sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
