"use client";

import { useOrderDetails } from "@/hooks/order/use-order";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Package, MapPin, CreditCard, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";

import { use } from "react";

export default function OrderDetailsPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = use(params);
  const { isAuthenticated } = useAuth();
  const { data: order, isLoading } = useOrderDetails(orderNumber);

  if (!isAuthenticated) {
    return null; // Will be handled by middleware or parent layout
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-40 mb-10" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Package className="h-16 w-16 text-foreground/20 mb-6" />
        <h1 className="text-2xl font-black uppercase tracking-widest mb-2">Order Not Found</h1>
        <p className="text-foreground/60 mb-8 max-w-md">We couldn't find the order you're looking for. It might have been placed from a different account.</p>
        <Link href="/orders">
          <Button>Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'PROCESSING': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'SHIPPED': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'DELIVERED': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'CANCELLED': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-foreground/10 text-foreground border-foreground/20';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/orders" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/60 hover:text-primary mb-8 transition-colors w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-border pb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-widest uppercase mb-2">Order #{order.orderNumber}</h1>
          <p className="text-sm font-medium text-foreground/60 flex items-center gap-2">
            Placed on {format(new Date(order.createdAt), 'MMMM dd, yyyy')} at {format(new Date(order.createdAt), 'h:mm a')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-full border ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
          <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <Download className="h-4 w-4" /> Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          {/* Items */}
          <div className="border border-border rounded-xl overflow-hidden bg-secondary/5">
            <div className="bg-secondary/30 px-6 py-4 border-b border-border">
              <h2 className="text-sm font-bold tracking-widest uppercase">Items in your order ({order.items.length})</h2>
            </div>
            <div className="p-6 space-y-6">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex gap-4 md:gap-6 border-b border-border pb-6 last:border-0 last:pb-0">
                  <div className="relative aspect-[3/4] w-20 md:w-24 flex-shrink-0 bg-secondary/50 rounded-sm overflow-hidden border border-border">
                    <Image
                      src={item.product.images?.[0]?.url || "/placeholder.jpg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <Link href={`/products/${item.product.slug}`} className="font-bold text-sm md:text-base hover:text-primary transition-colors line-clamp-2">
                          {item.product.name}
                        </Link>
                        <p className="font-bold whitespace-nowrap">₹{Number(item.price).toFixed(2)}</p>
                      </div>

                      <div className="mt-2 flex flex-col gap-1 text-xs text-foreground/60 uppercase tracking-widest">
                        {item.variant?.color && <p>Color: {item.variant.color}</p>}
                        {item.variant?.size && <p>Size: {item.variant.size}</p>}
                        <p className="mt-1 font-bold text-foreground/80">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          {/* Summary */}
          <div className="border border-border rounded-xl overflow-hidden bg-secondary/5">
            <div className="bg-secondary/30 px-6 py-4 border-b border-border">
              <h2 className="text-sm font-bold tracking-widest uppercase">Order Summary</h2>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground/70">Subtotal</span>
                <span className="font-semibold">₹{Number(order.subtotal).toFixed(2)}</span>
              </div>

              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-primary font-medium">
                  <span>Discount {order.coupon ? `(${order.coupon.code})` : ''}</span>
                  <span>-₹{Number(order.discount).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-foreground/70">Tax</span>
                <span className="font-semibold">₹{Number(order.tax).toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-foreground/70">Shipping</span>
                <span className="font-semibold">
                  {Number(order.shipping) > 0 ? `₹${Number(order.shipping).toFixed(2)}` : 'FREE'}
                </span>
              </div>

              <div className="border-t border-border pt-4 mt-4 flex justify-between">
                <span className="font-bold text-base uppercase tracking-widest">Total</span>
                <span className="font-black text-lg">₹{Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="border border-border rounded-xl overflow-hidden bg-secondary/5">
            <div className="bg-secondary/30 px-6 py-4 border-b border-border">
              <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Delivery
              </h2>
            </div>
            <div className="p-6">
              {order.shippingAddress ? (
                <div className="text-sm space-y-1">
                  <p className="font-bold">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                  <p className="pt-2 text-foreground/60">{order.shippingAddress.phone}</p>
                </div>
              ) : (
                <div className="text-sm">
                  {order.notes ? (
                    <p>{order.notes}</p>
                  ) : (
                    <p className="text-foreground/60 italic">No delivery address provided.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="border border-border rounded-xl overflow-hidden bg-secondary/5">
            <div className="bg-secondary/30 px-6 py-4 border-b border-border">
              <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Payment
              </h2>
            </div>
            <div className="p-6 text-sm">
              <p className="font-bold uppercase tracking-widest">{order.paymentMethod}</p>
              <p className="text-foreground/60 mt-1">Payment Status: <span className="font-semibold text-foreground">{order.paymentStatus}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
