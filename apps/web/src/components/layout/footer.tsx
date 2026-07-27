"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { newsletterService } from "@/services/newsletter.service";
import {
  Loader2,
  Mail,
  MapPin,
  Phone,
  Globe,
} from "lucide-react";
import { useStoreSettings } from "@/providers/store-settings-provider";

export function Footer() {
  const { general } = useStoreSettings();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await newsletterService.subscribe(email);
      toast.success(res.data?.message || "Thank you for subscribing to our newsletter!");
      setEmail("");
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || "Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  const social = general.socialLinks || {};

  return (
    <footer className="border-t border-border bg-card text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand Info, Dynamic Description & Address */}
          <div className="space-y-4">
            <Logo size="sm" showBadge />

            {/* Dynamic Store Description */}
            <p className="text-xs text-foreground/70 leading-relaxed font-medium">
              {general.storeDescription ||
                "Earthy luxury, hand-crafted comfort, and timeless apparel. Elevate your wardrobe with our refined cotton and linen prints."}
            </p>

            {/* Address, Phone & Email Contact Details */}
            <div className="space-y-1.5 text-xs text-foreground/80 pt-1">
              {general.storeAddress && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="leading-snug">{general.storeAddress}</span>
                </div>
              )}
              {general.supportPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                  <a href={`tel:${general.supportPhone}`} className="hover:text-primary transition-colors font-mono font-medium">
                    {general.supportPhone}
                  </a>
                </div>
              )}
              {general.supportEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                  <a href={`mailto:${general.supportEmail}`} className="hover:text-primary transition-colors font-medium">
                    {general.supportEmail}
                  </a>
                </div>
              )}
            </div>

            {/* Dynamic Social Media Links */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 rounded-lg bg-secondary border border-border/60 text-foreground/70 hover:text-primary hover:border-primary flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
              )}
              {social.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 rounded-lg bg-secondary border border-border/60 text-foreground/70 hover:text-primary hover:border-primary flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              )}
              {social.whatsapp && (
                <a
                  href={social.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 rounded-lg bg-secondary border border-border/60 text-foreground/70 hover:text-emerald-400 hover:border-emerald-500/50 flex items-center justify-center transition-colors"
                  aria-label="WhatsApp"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </a>
              )}
              {social.twitter && (
                <a
                  href={social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 rounded-lg bg-secondary border border-border/60 text-foreground/70 hover:text-sky-400 hover:border-sky-500/50 flex items-center justify-center transition-colors"
                  aria-label="Twitter / X"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </a>
              )}
              {social.youtube && (
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 rounded-lg bg-secondary border border-border/60 text-foreground/70 hover:text-rose-500 hover:border-rose-500/50 flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                    <path d="m10 15 5-3-5-3v6Z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Quick Shop */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold tracking-widest text-foreground uppercase">
              SHOP
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/products" className="text-xs font-semibold text-foreground/70 hover:text-primary transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-xs font-semibold text-foreground/70 hover:text-primary transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-xs font-semibold text-foreground/70 hover:text-primary transition-colors">
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
                <Link href="/info/faq" className="text-xs font-semibold text-foreground/70 hover:text-primary transition-colors">
                  FAQs & Support
                </Link>
              </li>
              <li>
                <Link href="/info/shipping" className="text-xs font-semibold text-foreground/70 hover:text-primary transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/info/returns" className="text-xs font-semibold text-foreground/70 hover:text-primary transition-colors">
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
            <form className="flex max-w-sm flex-col sm:flex-row gap-2" onSubmit={handleSubscribe}>
              <Input
                type="email"
                placeholder="YOUR EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold uppercase tracking-wider placeholder-foreground/30 focus-visible:border-primary focus-visible:outline-none"
                required
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto rounded-md bg-foreground px-4 py-2 text-xs font-bold tracking-widest text-background hover:bg-primary hover:text-primary-foreground transition-all duration-300 uppercase cursor-pointer flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>...</span>
                  </>
                ) : (
                  "JOIN"
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold tracking-wider text-foreground/50 uppercase">
            &copy; {new Date().getFullYear()} {(general.storeName || "KESARIYA COMMERCE").toUpperCase()}. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6 text-[10px] font-bold tracking-wider text-foreground/50 uppercase">
            <Link href="/info/privacy" className="hover:text-primary transition-colors">
              PRIVACY POLICY
            </Link>
            <Link href="/info/terms" className="hover:text-primary transition-colors">
              TERMS OF SERVICE
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
