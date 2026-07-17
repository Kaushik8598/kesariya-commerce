"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <span className="text-lg font-bold tracking-[0.25em] text-foreground">
              KESARIYA
            </span>
            <p className="text-xs text-foreground/70 leading-relaxed font-medium">
              Earthy luxury, hand-crafted comfort, and timeless apparel. Elevate your wardrobe with our refined cotton and linen prints.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-foreground/60 hover:text-primary transition-colors" aria-label="Instagram">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a href="#" className="text-foreground/60 hover:text-primary transition-colors" aria-label="Facebook">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#" className="text-foreground/60 hover:text-primary transition-colors" aria-label="Twitter / X">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Shop */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold tracking-widest text-foreground uppercase">
              SHOP
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/collection/shirts" className="text-xs font-semibold text-foreground/70 hover:text-primary transition-colors">
                  All Shirts
                </Link>
              </li>
              <li>
                <Link href="/collection/new-arrivals" className="text-xs font-semibold text-foreground/70 hover:text-primary transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/collection/best-sellers" className="text-xs font-semibold text-foreground/70 hover:text-primary transition-colors">
                  Best Sellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Help / Support */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold tracking-widest text-foreground uppercase">
              CUSTOMER ASSISTANCE
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/faq" className="text-xs font-semibold text-foreground/70 hover:text-primary transition-colors">
                  FAQs & Support
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-xs font-semibold text-foreground/70 hover:text-primary transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-xs font-semibold text-foreground/70 hover:text-primary transition-colors">
                  Returns & Refunds
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold tracking-widest text-foreground uppercase">
              SUBSCRIBE TO NEWSLETTER
            </h3>
            <p className="text-xs text-foreground/70 leading-relaxed font-medium">
              Join the club to get updates on new arrivals, exclusive discounts, and style tips.
            </p>
            <form className="flex max-w-sm flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="YOUR EMAIL"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold uppercase tracking-wider placeholder-foreground/30 focus-visible:border-primary focus-visible:outline-none"
                required
              />
              <Button
                type="submit"
                className="w-full sm:w-auto rounded-md bg-foreground px-4 py-2 text-xs font-bold tracking-widest text-background hover:bg-primary hover:text-primary-foreground transition-all duration-300 uppercase cursor-pointer"
              >
                JOIN
              </Button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold tracking-wider text-foreground/50 uppercase">
            &copy; {new Date().getFullYear()} KESARIYA COMMERCE. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6 text-[10px] font-bold tracking-wider text-foreground/50 uppercase">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              PRIVACY POLICY
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              TERMS OF SERVICE
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
