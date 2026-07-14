"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Search, ShoppingBag, User, LogOut, Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { label: "HOME", href: "/" },
    { label: "SHIRTS", href: "/collection/shirts" },
    { label: "NEW ARRIVALS", href: "/collection/new-arrivals" },
    { label: "BEST SELLERS", href: "/collection/best-sellers" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      {/* Top Banner */}
      <div className="bg-foreground text-background py-1.5 px-4 text-center text-xs font-semibold tracking-widest uppercase">
        SALE IS LIVE! 60% OFF - USE CODE KESARIYA
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-foreground/80 hover:text-primary transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Site Brand / Logo */}
          <div className="flex-1 md:flex-initial">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-extrabold tracking-[0.25em] text-foreground hover:opacity-90 transition-opacity">
                KESARIYA
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-xs font-bold tracking-widest transition-all duration-300 relative py-1 border-b-2 hover:text-primary ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-foreground/70 hover:border-foreground/30"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Search, Cart, Profile Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Search Bar Link */}
            <Link
              href="/search"
              className="p-1.5 text-foreground/70 hover:text-primary transition-colors rounded-full hover:bg-secondary"
              aria-label="Search products"
            >
              <Search className="h-5 w-5" />
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Shopping Bag / Cart */}
            <Link
              href="/bag"
              className="relative p-1.5 text-foreground/77 hover:text-primary transition-colors rounded-full hover:bg-secondary"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                0
              </span>
            </Link>

            {/* User Dropdown / Authentication */}
            <div className="relative">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1 p-1.5 text-foreground/77 hover:text-primary transition-colors rounded-full hover:bg-secondary cursor-pointer"
                  >
                    <User className="h-5 w-5" />
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2.5 w-56 rounded-md border border-border bg-card p-1 shadow-lg ring-1 ring-black/5 focus:outline-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="px-3 py-2 border-b border-border">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {user ? `${user.firstName} ${user.lastName}` : "My Account"}
                        </p>
                        <p className="text-[10px] text-foreground/60 uppercase tracking-widest font-bold mt-0.5">
                          {user?.role?.slug || "customer"}
                        </p>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground/80 hover:bg-secondary hover:text-foreground rounded-sm transition-colors"
                      >
                        <User className="h-4 w-4" />
                        My Profile
                      </Link>

                      {user?.role?.slug === "super-admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/5 rounded-sm transition-colors"
                        >
                          Admin Dashboard
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/5 rounded-sm transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-foreground/15 hover:border-primary text-xs font-bold tracking-widest text-foreground hover:text-primary transition-all duration-300"
                >
                  LOGIN
                </Link>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-in slide-in-from-top duration-300">
          <div className="space-y-1 px-4 py-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2.5 text-xs font-bold tracking-widest transition-colors ${
                    isActive ? "text-primary" : "text-foreground/70"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
