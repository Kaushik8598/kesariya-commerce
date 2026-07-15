"use client";

import Link from "next/link";
import { Tag, Copy, Check } from "lucide-react";
import { useState } from "react";

import { useInView } from "@/hooks/use-in-view";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { offers } from "@/constants/mock-data";

export function OffersBanner() {
  const { ref, isInView } = useInView({ threshold: 0.15 });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div
        className={`text-center transition-all duration-700 ${isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
          Limited Time
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Exclusive Offers
        </h2>
      </div>

      {/* Offers Cards */}
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {offers.map((offer, index) => (
          <div
            key={offer.id}
            className={`group relative overflow-hidden rounded-2xl transition-all duration-700 ${
              isInView
                ? "translate-y-0 opacity-100"
                : "translate-y-12 opacity-0"
            } ${index === 0 ? "bg-gradient-to-br from-primary via-primary/90 to-[#8B2020]" : "bg-gradient-to-br from-[#3E2723] via-[#5D4037] to-[#3E2723]"}`}
            style={{
              transitionDelay: isInView ? `${index * 150 + 200}ms` : "0ms",
            }}
          >
            {/* Decorative Elements */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-20 -top-20 size-60 rounded-full bg-white/[0.06]" />
              <div className="absolute -bottom-10 -left-10 size-40 rounded-full bg-white/[0.04]" />
            </div>

            <div className="relative flex flex-col gap-6 p-8 sm:p-10">
              {/* Top Row: Discount + Title */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
                    <Tag className="size-3 text-white/80" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                      Special Offer
                    </span>
                  </div>
                  <h3 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">
                    {offer.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm text-white/60">
                    {offer.subtitle}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-4xl font-black text-white sm:text-5xl">
                    {offer.discount}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                    Off
                  </p>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-white/20 bg-white/5 px-4 py-2.5 backdrop-blur-sm">
                  <span className="text-sm font-extrabold tracking-[0.15em] text-white">
                    {offer.code}
                  </span>
                </div>
                <button
                  onClick={() => copyCode(offer.code)}
                  className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/80 transition-all hover:bg-white/20 cursor-pointer"
                >
                  {copiedCode === offer.code ? (
                    <>
                      <Check className="size-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* Bottom Row: Timer + CTA */}
              <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-end">
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                    Ends In
                  </p>
                  <CountdownTimer endsAt={offer.endsAt} />
                </div>
                <Link
                  href="/products"
                  className="rounded-full bg-white px-6 py-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-black transition-all hover:bg-white/90 hover:shadow-lg"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
