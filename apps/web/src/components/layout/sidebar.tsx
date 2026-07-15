"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";

interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: SidebarItem[];
  title?: string;
}

export function Sidebar({ items, title }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card h-full flex flex-col p-4">
      {title && (
        <div className="px-3 py-4">
          <h2 className="text-xs font-extrabold tracking-[0.2em] text-foreground/50 uppercase">
            {title}
          </h2>
        </div>
      )}
      <nav className="flex-1 space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold tracking-wider transition-all duration-300 ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/70 hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className={`h-4.5 w-4.5 ${isActive ? "text-primary" : "text-foreground/60"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
