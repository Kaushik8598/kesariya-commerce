"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useStoreSettings } from "@/providers/store-settings-provider";

export interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showBadge?: boolean;
  showSubtitle?: boolean;
  subtitleText?: string;
  href?: string;
  className?: string;
  textClassName?: string;
  badgeClassName?: string;
}

export function Logo({
  size = "md",
  showBadge = true,
  showSubtitle = false,
  subtitleText = "LUXURY ETHNIC STORE",
  href = "/",
  className,
  textClassName,
  badgeClassName,
}: LogoProps) {
  const { general } = useStoreSettings();

  const sizeStyles = {
    sm: {
      badge: "h-7 w-7 text-xs rounded-lg",
      text: "text-base tracking-[0.2em]",
      subtitle: "text-[8px] tracking-[0.18em]",
      gap: "gap-2",
      imgHeight: "h-7",
    },
    md: {
      badge: "h-9 w-9 text-sm rounded-xl",
      text: "text-xl tracking-[0.22em]",
      subtitle: "text-[9px] tracking-[0.2em]",
      gap: "gap-2.5",
      imgHeight: "h-9",
    },
    lg: {
      badge: "h-11 w-11 text-base rounded-xl",
      text: "text-2xl tracking-[0.25em]",
      subtitle: "text-[10px] tracking-[0.22em]",
      gap: "gap-3",
      imgHeight: "h-11",
    },
    xl: {
      badge: "h-14 w-14 text-xl rounded-2xl",
      text: "text-3xl tracking-[0.28em]",
      subtitle: "text-[11px] tracking-[0.25em]",
      gap: "gap-3.5",
      imgHeight: "h-14",
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  const content = (
    <div className={cn("inline-flex items-center group cursor-pointer select-none", currentSize.gap, className)}>
      {/* Dynamic Store Logo Image (if configured in Admin Settings) */}
      {general.storeLogo ? (
        <div className={cn("relative max-w-xs flex items-center shrink-0", currentSize.imgHeight)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={general.storeLogo}
            alt={general.storeName || "Kesariya"}
            className="h-full w-auto object-contain filter drop-shadow"
          />
        </div>
      ) : (
        <>
          {/* Fallback Brand Icon Badge */}
          {showBadge && (
            <div
              className={cn(
                "flex items-center justify-center bg-primary text-primary-foreground font-black font-heading shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:shadow-primary/30 shrink-0 uppercase",
                currentSize.badge,
                badgeClassName
              )}
            >
              {(general.storeName || "K").charAt(0)}
            </div>
          )}

          {/* Brand Name & Optional Subtitle */}
          <div className="flex flex-col">
            <span
              className={cn(
                "font-black font-heading tracking-widest text-foreground transition-opacity group-hover:opacity-90 leading-none uppercase",
                currentSize.text,
                textClassName
              )}
            >
              {general.storeName || "KESARIYA"}
            </span>
            {showSubtitle && (
              <span
                className={cn(
                  "font-bold uppercase text-primary mt-1 leading-none font-sans opacity-90",
                  currentSize.subtitle
                )}
              >
                {subtitleText}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none inline-block" title={`${general.storeName || "Kesariya"} - Home`}>
        {content}
      </Link>
    );
  }

  return content;
}
