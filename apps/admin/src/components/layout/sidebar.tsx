"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Image as ImageIcon,
  Ticket,
  MessageSquareQuote,
  FileText,
  BarChart3,
  Search,
  Bell,
  Truck,
  Receipt,
  ScrollText,
  Settings,
  Store,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Mail,
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
      { label: "Product Reviews", href: "/reviews", icon: MessageSquare },
      { label: "Inventory", href: "/inventory", icon: Warehouse },
      { label: "Barcode & SKU", href: "/barcode", icon: Barcode },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Orders", href: "/orders", icon: ShoppingCart },
      { label: "Users & Customers", href: "/customers", icon: Users },
    ],
  },
  {
    label: "Storefront",
    items: [
      { label: "Coupons", href: "/coupons", icon: Ticket },
      { label: "Testimonials", href: "/testimonials", icon: MessageSquareQuote },
      { label: "CMS Pages", href: "/cms", icon: FileText },
      { label: "Newsletter", href: "/newsletter", icon: Mail },
    ],
  },
  {
    label: "Analytics & System",
    items: [
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Audit Logs", href: "/audit-logs", icon: ScrollText },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 h-screen flex flex-col bg-sidebar border-r border-sidebar-border shrink-0 transition-all duration-200",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          "h-16 border-b border-sidebar-border flex items-center px-4 shrink-0 transition-all",
          collapsed ? "justify-center" : "justify-between gap-3"
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-lg shadow-primary/25">
            <Store className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="font-extrabold text-sm text-foreground tracking-tight leading-none uppercase truncate">
                KESARIYA
              </div>
              <div className="text-[11px] font-medium text-muted-foreground mt-1 truncate">
                Admin Panel
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-hide">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1.5">
            {!collapsed && (
              <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/70 truncate">
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
                  className={cn(
                    "flex items-center gap-3 rounded-lg text-xs font-semibold transition-all duration-150 relative",
                    collapsed ? "justify-center p-2.5" : "px-3 py-2.5",
                    active
                      ? "bg-primary/15 text-primary font-bold border border-primary/25 shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse Toggle Footer Button */}
      <div className="p-3 border-t border-sidebar-border shrink-0">
        <button
          onClick={onToggle}
          className={cn(
            "flex items-center gap-3 w-full rounded-lg text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-150 cursor-pointer",
            collapsed ? "justify-center p-2.5" : "px-3 py-2.5"
          )}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span className="truncate">Collapse Menu</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
