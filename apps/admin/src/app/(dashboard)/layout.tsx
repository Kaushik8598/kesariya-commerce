"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/providers/auth-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/products": "Products Management",
  "/categories": "Categories Management",
  "/brands": "Brands Management",
  "/inventory": "Inventory Management",
  "/barcode": "Barcode & SKU Management",
  "/orders": "Orders Management",
  "/customers": "Users & Customers Management",
  "/coupons": "Offer & Coupon Management",
  "/testimonials": "Customer Testimonials Management",
  "/cms": "CMS Pages",
  "/analytics": "Analytics & Reports",
  "/audit-logs": "Audit Logs",
  "/settings": "Store Settings & Configurations",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin_sidebar_collapsed");
    if (saved === "true") {
      setCollapsed(true);
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("admin_sidebar_collapsed", String(next));
      return next;
    });
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirectTo=${pathname}`);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const title =
    pageTitles[pathname] ||
    pageTitles[Object.keys(pageTitles).find((k) => k !== "/" && pathname.startsWith(k)) || ""] ||
    "Admin";

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans antialiased">
      <Sidebar collapsed={collapsed} onToggle={toggleCollapsed} />
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-200",
          collapsed ? "ml-20" : "ml-64"
        )}
      >
        <Header title={title} />
        <main className="flex-1 p-6 md:p-8 w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
