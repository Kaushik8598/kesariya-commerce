"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/providers/auth-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/products": "Products Management",
  "/categories": "Categories Management",
  "/brands": "Brands Management",
  "/inventory": "Inventory Management",
  "/barcode": "Barcode & SKU Management",
  "/orders": "Orders Management",
  "/customers": "Customers Management",
  "/staff": "Staff & Role Management",
  "/theme": "Theme Management",
  "/homepage": "Homepage Management",
  "/banners": "Banner Management",
  "/coupons": "Offer & Coupon Management",
  "/cms": "CMS Pages",
  "/analytics": "Analytics & Reports",
  "/seo": "SEO Management",
  "/notifications": "Notification Management",
  "/shipping": "Shipping Management",
  "/tax": "GST & Tax Management",
  "/audit-logs": "Audit Logs",
  "/settings": "Settings",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirectTo=${pathname}`);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--background)",
        }}
      >
        <Loader2 size={32} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const title = pageTitles[pathname] || pageTitles[Object.keys(pageTitles).find((k) => k !== "/" && pathname.startsWith(k)) || ""] || "Admin";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--background)" }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          marginLeft: "var(--sidebar-width)",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          transition: "margin-left 0.2s ease",
        }}
      >
        <Header title={title} />
        <main style={{ flex: 1, padding: "24px 28px", overflowX: "hidden" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
