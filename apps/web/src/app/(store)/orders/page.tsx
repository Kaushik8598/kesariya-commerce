"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  Package,
  ChevronRight,
  Search,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ShoppingBag,
} from "lucide-react";
import { useUserOrders } from "@/hooks/order/use-order";
import { useStoreSettings } from "@/providers/store-settings-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function OrdersPage() {
  const { formatPrice } = useStoreSettings();

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    paymentStatus: "",
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const { data: orders, isLoading } = useUserOrders(debouncedFilters);

  const handleApplyFilters = () => {
    setDebouncedFilters(filters);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return { label: "Order Placed", bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock };
      case "PROCESSING":
        return { label: "Processing", bg: "bg-sky-500/10 text-sky-500 border-sky-500/20", icon: Package };
      case "SHIPPED":
        return { label: "Shipped", bg: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: Truck };
      case "DELIVERED":
        return { label: "Delivered", bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2 };
      case "CANCELLED":
        return { label: "Cancelled", bg: "bg-rose-500/10 text-rose-500 border-rose-500/20", icon: XCircle };
      default:
        return { label: status, bg: "bg-secondary text-foreground border-border", icon: Clock };
    }
  };

  return (
    <div className="border border-border rounded-2xl p-6 md:p-8 bg-card shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b border-border pb-6">
        <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20">
          <Package className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black uppercase tracking-wider font-heading text-foreground">
            Order History & Tracking
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            View, track, and manage all your past store orders
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 border border-border rounded-xl bg-secondary/10">
        <div className="sm:col-span-3">
          <Select
            value={filters.status}
            onValueChange={(val: any) => {
              const updated = { ...filters, status: String(val || "") };
              setFilters(updated);
              setDebouncedFilters(updated);
            }}
          >
            <SelectTrigger className="w-full h-10 text-xs">
              <SelectValue placeholder="All Order Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Order Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="SHIPPED">Shipped</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="sm:col-span-3">
          <Select
            value={filters.paymentStatus}
            onValueChange={(val: any) => {
              const updated = { ...filters, paymentStatus: String(val || "") };
              setFilters(updated);
              setDebouncedFilters(updated);
            }}
          >
            <SelectTrigger className="w-full h-10 text-xs">
              <SelectValue placeholder="All Payment Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Payment Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="sm:col-span-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search Order Number..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
              className="pl-9 h-10 text-xs"
            />
          </div>
          <Button
            onClick={handleApplyFilters}
            className="h-10 px-4 text-xs font-bold uppercase tracking-wider shrink-0"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center max-w-sm mx-auto">
          <div className="h-16 w-16 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-4 text-muted-foreground">
            <Package className="h-8 w-8 opacity-60" />
          </div>
          <h3 className="text-base font-extrabold uppercase tracking-wider font-heading text-foreground">
            No Orders Found
          </h3>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            You haven't placed any orders yet or no orders match your search criteria.
          </p>
          <Link href="/products" className="mt-6">
            <Button className="gap-2 text-xs font-bold uppercase tracking-wider">
              <ShoppingBag className="h-4 w-4" /> Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order: any) => {
            const statusInfo = getStatusBadge(order.status);
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={order.id}
                className="border border-border rounded-xl p-5 bg-card transition-all hover:border-foreground/20 space-y-4 shadow-sm"
              >
                {/* Header Row: Order Number + Placed Date + Status Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-foreground font-heading">
                        ORDER #{order.orderNumber}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Placed on {format(new Date(order.createdAt), "MMMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border flex items-center gap-1 ${statusInfo.bg}`}
                    >
                      <StatusIcon className="h-3 w-3" /> {statusInfo.label}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary border border-border text-muted-foreground">
                      Payment {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Items Preview Row */}
                <div className="flex items-center justify-between gap-4 py-1">
                  <div className="flex items-center gap-3 overflow-x-auto py-1">
                    {order.items.slice(0, 4).map((item: any) => (
                      <div
                        key={item.id}
                        className="relative h-14 w-14 rounded-lg bg-secondary overflow-hidden border border-border shrink-0"
                        title={item.product?.name}
                      >
                        <Image
                          src={item.product?.images?.[0]?.url || "/placeholder.jpg"}
                          alt={item.product?.name || "Product"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="h-14 w-14 rounded-lg bg-secondary border border-border flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0 font-mono">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>

                  {/* Summary & View Details CTA Button */}
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground font-medium">Total Amount</p>
                    <p className="text-base font-black text-foreground font-heading">
                      {formatPrice(Number(order.total))}
                    </p>
                  </div>
                </div>

                {/* Footer Action Row */}
                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">
                    {order.items.length} {order.items.length === 1 ? "Item" : "Items"} Total
                  </span>
                  <Link href={`/orders/${order.orderNumber}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold uppercase tracking-wider gap-1.5 h-9 hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                      <span>View Order Details</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
