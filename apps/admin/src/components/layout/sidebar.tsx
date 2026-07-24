"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  Warehouse,
  Barcode,
  ShoppingCart,
  Users,
  UserCog,
  Palette,
  Home,
  Image,
  Ticket,
  FileText,
  BarChart3,
  Search,
  Bell,
  Truck,
  Receipt,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  Store,
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { label: "Products", href: "/products", icon: Package },
      { label: "Categories", href: "/categories", icon: FolderTree },
      { label: "Brands", href: "/brands", icon: Tag },
      { label: "Inventory", href: "/inventory", icon: Warehouse },
      { label: "Barcode & SKU", href: "/barcode", icon: Barcode },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Orders", href: "/orders", icon: ShoppingCart },
      { label: "Customers", href: "/customers", icon: Users },
      { label: "Staff & Roles", href: "/staff", icon: UserCog },
    ],
  },
  {
    label: "Storefront",
    items: [
      { label: "Theme", href: "/theme", icon: Palette },
      { label: "Homepage", href: "/homepage", icon: Home },
      { label: "Banners", href: "/banners", icon: Image },
      { label: "Coupons", href: "/coupons", icon: Ticket },
      { label: "CMS Pages", href: "/cms", icon: FileText },
    ],
  },
  {
    label: "Analytics & System",
    items: [
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "SEO", href: "/seo", icon: Search },
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Shipping", href: "/shipping", icon: Truck },
      { label: "GST & Tax", href: "/tax", icon: Receipt },
      { label: "Audit Logs", href: "/audit-logs", icon: ScrollText },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      style={{
        width: collapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)",
        background: "var(--background-secondary)",
        borderRight: "1px solid var(--border)",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.2s ease",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: "var(--header-height)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "0 16px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            background: "var(--primary)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Store size={18} color="white" />
        </div>
        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--foreground)", whiteSpace: "nowrap" }}>
              Kesariya
            </div>
            <div style={{ fontSize: 11, color: "var(--foreground-muted)", whiteSpace: "nowrap" }}>
              Admin Panel
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav
        style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "12px 8px" }}
        className="no-scrollbar"
      >
        {navGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: 4 }}>
            {!collapsed && (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--foreground-subtle)",
                  padding: "12px 8px 4px",
                }}
              >
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: collapsed ? "10px 0" : "9px 10px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    borderRadius: 7,
                    marginBottom: 2,
                    color: active ? "var(--primary)" : "var(--foreground-muted)",
                    background: active ? "var(--accent-muted)" : "transparent",
                    fontWeight: active ? 600 : 400,
                    fontSize: 13.5,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "var(--surface-hover)";
                      (e.currentTarget as HTMLElement).style.color = "var(--foreground)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "var(--foreground-muted)";
                    }
                  }}
                >
                  <Icon size={17} style={{ flexShrink: 0 }} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
            {collapsed && (
              <div style={{ height: 8 }} />
            )}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div style={{ padding: "12px 8px", borderTop: "1px solid var(--border)" }}>
        <button
          onClick={() => setCollapsed((c) => !c)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            padding: collapsed ? "9px 0" : "9px 10px",
            justifyContent: collapsed ? "center" : "flex-start",
            borderRadius: 7,
            border: "none",
            background: "transparent",
            color: "var(--foreground-muted)",
            cursor: "pointer",
            fontSize: 13.5,
          }}
        >
          {collapsed ? <ChevronRight size={17} /> : (
            <>
              <ChevronLeft size={17} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
