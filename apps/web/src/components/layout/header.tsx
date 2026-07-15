"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, ShoppingBag, User, LogOut, Menu, X, ChevronDown, Heart, Package } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: "HOME", href: "/" },
    { label: "SHIRTS", href: "/collection/shirts" },
    { label: "NEW ARRIVALS", href: "/collection/new-arrivals" },
    { label: "BEST SELLERS", href: "/collection/best-sellers" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
        {/* Top Banner */}
        <div className="bg-foreground text-background py-1.5 px-4 text-center text-xs font-semibold tracking-widest uppercase">
          SALE IS LIVE! 60% OFF - USE CODE KESARIYA
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            
            {/* Site Brand / Logo */}
            <div className="flex-1 md:flex-initial flex items-center justify-center md:justify-start">
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

            {/* Actions (Desktop + Search for Mobile) */}
            <div className="flex items-center gap-2 sm:gap-4 absolute md:static right-4">
              
              {/* Search Bar Link (Visible on both) */}
              <Link
                href="/search"
                className="p-1.5 text-foreground/70 hover:text-primary transition-colors rounded-full hover:bg-secondary"
                aria-label="Search products"
              >
                <Search className="h-5 w-5" />
              </Link>

              {/* Theme Toggle (Hidden on mobile) */}
              <div className="hidden md:block">
                <ThemeToggle />
              </div>

              {/* Wishlist (Hidden on mobile, bottom nav used) */}
              <Link
                href="/wishlist"
                className="hidden md:flex p-1.5 text-foreground/77 hover:text-primary transition-colors rounded-full hover:bg-secondary"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
              </Link>

              {/* Shopping Bag / Cart (Hidden on mobile, bottom nav used) */}
              <Link
                href="/cart"
                className="hidden md:flex relative p-1.5 text-foreground/77 hover:text-primary transition-colors rounded-full hover:bg-secondary"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  0
                </span>
              </Link>

              {/* User Dropdown / Authentication (Hidden on mobile) */}
              <div className="hidden md:block relative">
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
                      <div className="absolute right-0 mt-2.5 w-56 rounded-md border border-border bg-card p-1 shadow-lg ring-1 ring-black/5 focus:outline-hidden animate-in fade-in slide-in-from-top-1 duration-200 z-50">
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
                        
                        <Link
                          href="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground/80 hover:bg-secondary hover:text-foreground rounded-sm transition-colors"
                        >
                          <Package className="h-4 w-4" />
                          My Orders
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
      </header>

      {/* Mobile Sticky Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between border-t border-border bg-background/90 backdrop-blur-md px-6 py-2 pb-safe">
        <Link href="/wishlist" className="flex flex-col items-center justify-center gap-1 text-foreground/70 hover:text-primary transition-colors">
          <Heart className="h-5 w-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Wishlist</span>
        </Link>
        <Link href="/cart" className="relative flex flex-col items-center justify-center gap-1 text-foreground/70 hover:text-primary transition-colors">
          <ShoppingBag className="h-5 w-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Bag</span>
          <span className="absolute -top-1 right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
            0
          </span>
        </Link>
        <Link href="/orders" className="flex flex-col items-center justify-center gap-1 text-foreground/70 hover:text-primary transition-colors">
          <Package className="h-5 w-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Orders</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center justify-center gap-1 text-foreground/70 hover:text-primary transition-colors">
          <User className="h-5 w-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Profile</span>
        </Link>
        <button 
          onClick={() => setMobileMenuOpen(true)} 
          className="flex flex-col items-center justify-center gap-1 text-foreground/70 hover:text-primary transition-colors cursor-pointer"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Menu</span>
        </button>
      </div>

      {/* Full Screen Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex h-16 items-center justify-between px-4 border-b border-border">
            <span className="text-sm font-extrabold tracking-[0.25em] uppercase">MENU</span>
            <button 
              onClick={() => setMobileMenuOpen(false)} 
              className="p-2 text-foreground/80 hover:text-foreground cursor-pointer"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col">
            {/* Nav Links */}
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.label} 
                    href={link.href} 
                    onClick={() => setMobileMenuOpen(false)} 
                    className={`text-xl font-black tracking-widest uppercase transition-colors ${
                      isActive ? "text-primary" : "text-foreground hover:text-primary"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-auto pt-10 space-y-8">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between border-t border-border pt-8">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/70">
                  Appearance
                </span>
                <ThemeToggle />
              </div>

              {/* Authentication */}
              <div className="border-t border-border pt-8 pb-8">
                {!isAuthenticated ? (
                  <Link 
                    href="/login" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="flex items-center justify-center w-full py-4 bg-foreground text-background font-black uppercase tracking-[0.2em] text-xs rounded-xl hover:bg-primary transition-colors"
                  >
                    Login / Register
                  </Link>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{user?.firstName} {user?.lastName}</p>
                        <p className="text-[10px] uppercase tracking-widest text-foreground/50">{user?.email}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setMobileMenuOpen(false); logout(); }} 
                      className="flex items-center justify-center w-full py-4 border-2 border-border font-black uppercase tracking-[0.2em] text-xs rounded-xl text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
