"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-lg bg-card/50 max-w-md mx-auto my-12 animate-in fade-in-50 duration-500">
      <div className="p-4 rounded-full bg-secondary/80 text-foreground/60 mb-4">
        <Icon className="h-10 w-10" />
      </div>
      <h3 className="text-sm font-bold tracking-widest text-foreground uppercase mb-2">
        {title}
      </h3>
      <p className="text-xs font-medium text-foreground/60 leading-relaxed mb-6">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="rounded-full bg-foreground px-6 py-2.5 text-xs font-bold tracking-widest text-background hover:bg-primary hover:text-primary-foreground transition-all duration-300 uppercase shadow-xs hover:shadow-md"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
