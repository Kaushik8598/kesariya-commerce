"use client";

import { useState } from "react";
import { Mail, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInView } from "@/hooks/use-in-view";

export function NewsletterSection() {
  const { ref, isInView } = useInView({ threshold: 0.15 });
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3E2723] via-[#4E342E] to-[#3E2723] transition-all duration-700 ${isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
      >
        {/* Decorative Elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 size-80 rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 size-60 rounded-full bg-[#E8A87C]/10 blur-[80px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative px-6 py-16 text-center sm:px-12 sm:py-20 lg:px-20">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <Mail className="size-6 text-white/80" />
          </div>

          <h2 className="mt-6 text-3xl font-extrabold text-white sm:text-4xl">
            Join the Kesariya Club
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/50">
            Subscribe for exclusive access to new arrivals, limited-edition
            drops, and members-only discounts.
          </p>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YOUR EMAIL ADDRESS"
                required
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] pr-4 text-xs font-bold uppercase tracking-widest text-white placeholder:text-white/25 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary backdrop-blur-sm"
              />
            </div>
            <Button
              type="submit"
              disabled={subscribed}
              className="group flex items-center justify-center gap-2 rounded-xl bg-white px-6 text-xs font-extrabold uppercase tracking-[0.2em] text-[#3E2723] transition-all hover:bg-primary hover:text-white disabled:opacity-80 cursor-pointer"
            >
              {subscribed ? (
                <>
                  <Check className="size-4" />
                  Subscribed
                </>
              ) : (
                <>
                  Subscribe
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-4 text-[10px] text-white/30">
            No spam, ever. Unsubscribe anytime. By subscribing you agree to our
            Privacy Policy.
          </p>
        </div>
      </div>
    </section>
  );
}
