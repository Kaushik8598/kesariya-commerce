"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, User } from "lucide-react";

export function MobileNavigation() {
  const pathname = usePathname();

  const menuItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Search", href: "/search", icon: Search },
    { label: "Bag", href: "/bag", icon: ShoppingBag, badge: true },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-lg border-t border-border shadow-lg">
      <div className="flex h-16 items-center justify-around">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full text-center relative py-1"
            >
              <div className="relative">
                <Icon
                  className={`h-5.5 w-5.5 transition-colors duration-300 ${
                    isActive ? "text-primary" : "text-foreground/60"
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
                    0
                  </span>
                )}
              </div>
              <span
                className={`text-[9px] font-bold tracking-wider mt-1 uppercase ${
                  isActive ? "text-primary font-extrabold" : "text-foreground/50"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
