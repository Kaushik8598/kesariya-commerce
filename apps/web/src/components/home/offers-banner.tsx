"use client";

import Link from "next/link";
import { Tag, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

import { CountdownTimer } from "@/components/ui/countdown-timer";
import { usePublicCoupons } from "@/hooks/coupons/use-public-coupons";

export function OffersBanner() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { coupons, loading } = usePublicCoupons();

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Hide Exclusive Offers section if loading or no active coupons are found in Admin
  if (loading || !coupons || coupons.length === 0) {
    return null;
  }

  // Fallback timer if endDate is not set
  const defaultEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary font-mono">
          Limited Time Deals
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl font-heading">
          Exclusive Offers & Coupons
        </h2>
      </div>

      {/* Dynamic Active Coupon Cards */}
      <div className={`mt-12 grid gap-6 ${coupons.length === 1 ? "max-w-2xl mx-auto" : "md:grid-cols-2"}`}>
        {coupons.map((coupon, index) => {
          const discountStr =
            coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `₹${coupon.value}`;
          const titleStr = coupon.description || `${coupon.code} Exclusive Offer`;
          const subTitleStr = coupon.minOrderAmount
            ? `Valid on orders above ₹${coupon.minOrderAmount}`
            : "Valid on all men's shirt collections";
          const endsAt = coupon.endDate ? new Date(coupon.endDate).toISOString() : defaultEndsAt;

          return (
            <div
              key={coupon.id}
              className={`group relative overflow-hidden rounded-2xl transition-all duration-300 shadow-xl ${
                index % 2 === 0
                  ? "bg-gradient-to-br from-primary via-primary/90 to-[#8B2020]"
                  : "bg-gradient-to-br from-[#3E2723] via-[#5D4037] to-[#3E2723]"
              }`}
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
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 font-mono">
                        SPECIAL COUPON
                      </span>
                    </div>
                    <h3 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl font-heading">
                      {titleStr}
                    </h3>
                    <p className="mt-2 max-w-xs text-sm text-white/80 font-medium">
                      {subTitleStr}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-4xl font-black text-white sm:text-5xl font-heading">
                      {discountStr}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                      OFF
                    </p>
                  </div>
                </div>

                {/* Coupon Code Copy Row */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-lg border border-dashed border-white/30 bg-white/10 px-4 py-2.5 backdrop-blur-sm">
                    <span className="text-sm font-extrabold tracking-[0.2em] text-white font-mono uppercase">
                      {coupon.code}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => copyCode(coupon.code)}
                    className="flex items-center gap-1.5 rounded-lg bg-white/15 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-white hover:text-black cursor-pointer"
                  >
                    {copiedCode === coupon.code ? (
                      <>
                        <Check className="size-3 text-green-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>

                {/* Bottom Row: Timer + CTA */}
                <div className="flex flex-col items-start justify-between gap-4 border-t border-white/15 pt-6 sm:flex-row sm:items-end">
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/60 font-mono">
                      Offer Ends In
                    </p>
                    <CountdownTimer endsAt={endsAt} />
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
          );
        })}
      </div>
    </section>
  );
}
