"use client";

import Image from "next/image";
import { Wrench, Mail, Phone, MapPin, Sparkles, Clock } from "lucide-react";
import { useStoreSettings } from "@/providers/store-settings-provider";

export function MaintenanceScreen() {
  const { general } = useStoreSettings();

  return (
    <div className="fixed inset-0 z-[99999] min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-center p-6 text-center select-none overflow-y-auto">
      {/* Background Decorator Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full space-y-8 relative z-10 py-8">
        {/* Brand Logo / Title */}
        <div className="flex flex-col items-center justify-center space-y-4">
          {general.storeLogo ? (
            <div className="relative h-20 w-64 max-w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={general.storeLogo}
                alt={general.storeName}
                className="h-full w-full object-contain mx-auto filter drop-shadow"
              />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-lg">
              <Sparkles className="h-8 w-8 animate-pulse" />
            </div>
          )}

          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1.5 shadow-xs">
            <Clock className="h-3.5 w-3.5" /> Scheduled Store Maintenance
          </span>
        </div>

        {/* Hero Card */}
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-2xl space-y-4 backdrop-blur-md">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
            <Wrench className="h-7 w-7 animate-bounce" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading">
            {general.storeName} is Under Maintenance
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            We are currently upgrading our store infrastructure to bring you an extraordinary shopping experience. Please check back shortly!
          </p>

          {/* Customer Support Contact */}
          <div className="pt-6 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {general.supportEmail && (
              <a
                href={`mailto:${general.supportEmail}`}
                className="p-3 rounded-xl bg-secondary/50 border border-border/50 flex items-center gap-3 hover:border-primary transition-colors group"
              >
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                    Email Support
                  </span>
                  <span className="text-xs font-semibold text-foreground truncate block group-hover:text-primary transition-colors">
                    {general.supportEmail}
                  </span>
                </div>
              </a>
            )}

            {general.supportPhone && (
              <a
                href={`tel:${general.supportPhone}`}
                className="p-3 rounded-xl bg-secondary/50 border border-border/50 flex items-center gap-3 hover:border-primary transition-colors group"
              >
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                    Phone / WhatsApp
                  </span>
                  <span className="text-xs font-semibold text-foreground font-mono truncate block group-hover:text-primary transition-colors">
                    {general.supportPhone}
                  </span>
                </div>
              </a>
            )}
          </div>

          {general.storeAddress && (
            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">{general.storeAddress}</span>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">
          &copy; {new Date().getFullYear()} {general.storeName.toUpperCase()}. ALL RIGHTS RESERVED.
        </p>
      </div>
    </div>
  );
}
