"use client";

import { Truck, RotateCcw, Shield, Headphones } from "lucide-react";

import { useInView } from "@/hooks/use-in-view";
import { features } from "@/constants/mock-data";

const iconMap: Record<string, React.ElementType> = {
  Truck,
  RotateCcw,
  Shield,
  Headphones,
};

export function FeaturesStrip() {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section
      ref={ref}
      className="border-y border-border bg-card"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon] || Shield;
            return (
              <div
                key={feature.title}
                className={`flex items-center gap-4 transition-all duration-700 ${
                  isInView
                    ? "translate-y-0 opacity-100"
                    : "translate-y-6 opacity-0"
                }`}
                style={{
                  transitionDelay: isInView ? `${index * 100}ms` : "0ms",
                }}
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {feature.title}
                  </p>
                  <p className="text-[10px] font-medium text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
