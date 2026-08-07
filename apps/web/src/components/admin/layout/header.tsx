"use client";

import { Bell, Search, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { getInitials } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="h-16 bg-sidebar/90 backdrop-blur border-b border-border flex items-center justify-between px-6 sticky top-0 z-30 shrink-0">
      {/* Page Title */}
      <div className="font-bold text-lg text-foreground tracking-tight">
        {title}
      </div>

      {/* Right side tools */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Quick search..."
            className="h-9 w-52 pl-9 pr-3 rounded-lg bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Bell Button */}
        <button className="relative h-9 w-9 flex items-center justify-center bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full ring-2 ring-background" />
        </button>

        {/* User Profile Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2.5 p-1 pr-3 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
          >
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0 shadow-sm">
              {user ? getInitials(`${user.firstName} ${user.lastName}`) : "SA"}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-foreground leading-tight">
                {user ? `${user.firstName} ${user.lastName}` : "Super Admin"}
              </div>
              <div className="text-[10px] text-muted-foreground capitalize">
                {user?.role?.slug || "super-admin"}
              </div>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-popover shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <Link
                href="/admin/settings"
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                <Settings className="h-4 w-4 text-muted-foreground" /> Settings
              </Link>
              <div className="my-1 border-t border-border" />
              <button
                onClick={logout}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-left cursor-pointer"
              >
                <LogOut className="h-4 w-4 text-destructive" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
