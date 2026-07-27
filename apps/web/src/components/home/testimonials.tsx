"use client";

import { Quote } from "lucide-react";
import { RatingStars } from "@/components/ui/rating-stars";
import { usePublicTestimonials } from "@/hooks/testimonials/use-testimonials";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export function Testimonials() {
  const { testimonials, loading } = usePublicTestimonials();

  if (loading || !testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-secondary/50 py-20">
      {/* Background Decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 size-60 rounded-full bg-primary/[0.03] blur-3xl" />
        <div className="absolute -right-20 bottom-10 size-60 rounded-full bg-primary/[0.03] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 3500,
            }),
          ]}
          className="w-full"
        >
          {/* Section Header */}
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary font-mono">
                Customer Testimonials
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl font-heading">
                Customer Stories
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex items-center gap-2">
                <CarouselPrevious className="static translate-y-0 h-10 w-10 border-border bg-card text-foreground/60 hover:border-primary hover:text-primary transition-all" />
                <CarouselNext className="static translate-y-0 h-10 w-10 border-border bg-card text-foreground/60 hover:border-primary hover:text-primary transition-all" />
              </div>
            </div>
          </div>

          {/* Testimonials Carousel */}
          <div className="mt-12">
            <CarouselContent className="-ml-5">
              {testimonials.map((testimonial) => {
                const nameParts = testimonial.name.trim().split(" ");
                const initials = (
                  (nameParts[0]?.[0] || "") + (nameParts[1]?.[0] || "")
                ).toUpperCase() || "K";

                return (
                  <CarouselItem
                    key={testimonial.id}
                    className="pl-5 basis-auto"
                  >
                    <div className="w-[340px] sm:w-[380px] h-full">
                      <div className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 sm:p-8">
                        {/* Quote Icon */}
                        <Quote className="size-8 text-primary/25" />

                        {/* Comment */}
                        <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/80 font-medium italic">
                          &ldquo;{testimonial.comment}&rdquo;
                        </p>

                        {/* Product Purchased */}
                        {testimonial.product && (
                          <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-primary font-mono">
                            Purchased: {testimonial.product}
                          </p>
                        )}

                        {/* Rating */}
                        <div className="mt-3">
                          <RatingStars rating={testimonial.rating} size="md" />
                        </div>

                        {/* Author Info */}
                        <div className="mt-5 flex items-center gap-3 border-t border-border/60 pt-5">
                          {/* Avatar / Initials */}
                          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-xs font-extrabold text-primary font-mono">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground font-heading">
                              {testimonial.name}
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              {testimonial.location || testimonial.role || "Verified Customer"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </div>
        </Carousel>
      </div>
    </section>
  );
}
