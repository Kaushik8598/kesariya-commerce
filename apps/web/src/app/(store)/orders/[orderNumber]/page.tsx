"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  MapPin,
  Download,
  Ruler,
  ArrowLeft,
  Printer,
  ShieldCheck,
  Phone,
  Mail,
  User,
  ShoppingBag,
} from "lucide-react";
import { useOrderDetails } from "@/hooks/order/use-order";
import { useAuth } from "@/providers/auth-provider";
import { useStoreSettings, GeneralStoreSettings } from "@/providers/store-settings-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Price } from "@/components/ui/price";

// Helper function to handle Invoice generation and printing
const handlePrintInvoice = (order: any, general: GeneralStoreSettings, formatPrice: (val: number) => string) => {
  const printWindow = window.open("", "_blank", "width=850,height=1000");
  if (!printWindow) return;

  const addr = order.shippingAddress;
  const itemsHtml = order.items
    .map(
      (item: any, idx: number) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px; font-size: 12px; color: #111827;">${idx + 1}</td>
      <td style="padding: 12px; font-size: 12px; color: #111827;">
        <strong>${item.product?.name || "Product"}</strong>
        ${item.variant?.color ? `<div style="font-size: 10px; color: #6b7280;">Color: ${item.variant.color} | Size: ${item.variant.size || "N/A"}</div>` : ""}
        ${item.measurementProfile?.name ? `<div style="font-size: 10px; color: #b91c1c;">Custom Fit: ${item.measurementProfile.name}</div>` : ""}
      </td>
      <td style="padding: 12px; font-size: 12px; color: #111827; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; font-size: 12px; color: #111827; text-align: right;">${formatPrice(Number(item.price))}</td>
      <td style="padding: 12px; font-size: 12px; font-weight: bold; color: #111827; text-align: right;">${formatPrice(Number(item.price * item.quantity))}</td>
    </tr>
  `
    )
    .join("");

  const invoiceHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice - ${order.orderNumber}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 40px; color: #1f2937; background: #fff; }
          .invoice-container { max-width: 800px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 40px; border-radius: 8px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111827; padding-bottom: 20px; margin-bottom: 30px; }
          .store-name { font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: #111827; }
          .invoice-title { font-size: 28px; font-weight: 800; text-align: right; color: #111827; }
          .meta-table { width: 100%; margin-bottom: 30px; }
          .meta-table td { vertical-align: top; width: 50%; font-size: 12px; line-height: 1.6; }
          .table-items { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .table-items th { background: #f3f4f6; padding: 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #374151; border-bottom: 2px solid #d1d5db; }
          .summary-table { width: 320px; margin-left: auto; border-collapse: collapse; font-size: 12px; }
          .summary-table td { padding: 6px 12px; }
          .summary-table tr.total td { font-size: 16px; font-weight: 900; border-top: 2px solid #111827; padding-top: 10px; }
          .footer-text { margin-top: 50px; border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
          @media print { body { padding: 0; } .invoice-container { border: none; padding: 0; } }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div>
              ${
                general.storeLogo
                  ? `<img src="${general.storeLogo}" style="max-height: 50px; width: auto; margin-bottom: 8px;" />`
                  : `<div class="store-name">${general.storeName || "STORE INVOICE"}</div>`
              }
              <div style="font-size: 11px; color: #4b5563;">
                ${general.storeAddress ? `<div>${general.storeAddress}</div>` : ""}
                ${general.supportEmail ? `<div>Email: ${general.supportEmail}</div>` : ""}
                ${general.supportPhone ? `<div>Phone: ${general.supportPhone}</div>` : ""}
              </div>
            </div>
            <div>
              <div class="invoice-title">INVOICE</div>
              <div style="font-size: 12px; color: #4b5563; font-family: monospace; text-align: right; margin-top: 4px;">
                #${order.orderNumber}
              </div>
              <div style="font-size: 11px; color: #6b7280; text-align: right; margin-top: 2px;">
                Date: ${format(new Date(order.createdAt), "MMMM dd, yyyy")}
              </div>
            </div>
          </div>

          <table class="meta-table">
            <tr>
              <td>
                <strong style="font-size: 11px; text-transform: uppercase; color: #6b7280; letter-spacing: 1px;">Billed & Shipped To:</strong><br>
                ${
                  addr
                    ? `
                  <strong>${addr.fullName || "Customer"}</strong><br>
                  ${addr.addressLine1 || ""}<br>
                  ${addr.addressLine2 ? `${addr.addressLine2}<br>` : ""}
                  ${addr.city || ""}, ${addr.state || ""} ${addr.postalCode || ""}<br>
                  Phone: ${addr.phone || "N/A"}
                `
                    : `<div>${order.notes || "Customer Direct Order"}</div>`
                }
              </td>
              <td style="text-align: right;">
                <strong style="font-size: 11px; text-transform: uppercase; color: #6b7280; letter-spacing: 1px;">Payment Summary:</strong><br>
                Method: <strong>${order.paymentMethod || "COD"}</strong><br>
                Status: <strong>${order.paymentStatus || "PENDING"}</strong><br>
                Order Status: <strong>${order.status || "PENDING"}</strong>
              </td>
            </tr>
          </table>

          <table class="table-items">
            <thead>
              <tr>
                <th style="width: 40px;">#</th>
                <th>Item Description</th>
                <th style="text-align: center; width: 60px;">Qty</th>
                <th style="text-align: right; width: 100px;">Price</th>
                <th style="text-align: right; width: 110px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <table class="summary-table">
            <tr>
              <td style="color: #6b7280;">Subtotal:</td>
              <td style="text-align: right; font-weight: 600;">${formatPrice(Number(order.subtotal))}</td>
            </tr>
            ${
              Number(order.discount) > 0
                ? `
              <tr>
                <td style="color: #059669;">Discount ${order.coupon ? `(${order.coupon.code})` : ""}:</td>
                <td style="text-align: right; font-weight: 600; color: #059669;">-${formatPrice(Number(order.discount))}</td>
              </tr>
            `
                : ""
            }
            <tr>
              <td style="color: #6b7280;">Taxes & GST:</td>
              <td style="text-align: right; font-weight: 600;">${formatPrice(Number(order.tax))}</td>
            </tr>
            <tr>
              <td style="color: #6b7280;">Shipping Fee:</td>
              <td style="text-align: right; font-weight: 600;">${Number(order.shipping) > 0 ? formatPrice(Number(order.shipping)) : "FREE"}</td>
            </tr>
            <tr class="total">
              <td>Total Amount:</td>
              <td style="text-align: right;">${formatPrice(Number(order.total))}</td>
            </tr>
          </table>

          <div class="footer-text">
            Thank you for shopping with ${general.storeName || "us"}! • Official Customer Receipt
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(invoiceHtml);
  printWindow.document.close();
};

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = use(params);
  const { isAuthenticated } = useAuth();
  const { formatPrice, general } = useStoreSettings();
  const { data: order, isLoading } = useOrderDetails(orderNumber);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-44 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <Skeleton className="h-56 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center max-w-md mx-auto">
        <div className="h-16 w-16 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-4 text-muted-foreground">
          <Package className="h-8 w-8 opacity-60" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-heading">
          Order Not Found
        </h1>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          We couldn't find order <span className="font-mono font-bold text-foreground">#{orderNumber}</span>. Please verify your order list.
        </p>
        <Link href="/orders" className="mt-6">
          <Button className="gap-2 text-xs font-bold uppercase tracking-wider">
            <ArrowLeft className="h-4 w-4" /> Back to My Orders
          </Button>
        </Link>
      </div>
    );
  }

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

  const statusInfo = getStatusBadge(order.status);
  const StatusIcon = statusInfo.icon;

  // Timeline Order Status Tracker Steps
  const orderSteps = [
    { key: "PENDING", label: "Placed" },
    { key: "PROCESSING", label: "Processing" },
    { key: "SHIPPED", label: "Shipped" },
    { key: "DELIVERED", label: "Delivered" },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case "PENDING": return 0;
      case "PROCESSING": return 1;
      case "SHIPPED": return 2;
      case "DELIVERED": return 3;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Orders
        </Link>

        {/* Order Title Header Banner */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground font-heading">
                ORDER #{order.orderNumber}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border flex items-center gap-1.5 ${statusInfo.bg}`}
              >
                <StatusIcon className="h-3.5 w-3.5" /> {statusInfo.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2 pt-1 font-medium">
              <CalendarIcon className="h-3.5 w-3.5 text-primary" /> Placed on{" "}
              <span className="text-foreground font-semibold">
                {format(new Date(order.createdAt), "MMMM dd, yyyy 'at' h:mm a")}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => handlePrintInvoice(order, general, formatPrice)}
              variant="outline"
              className="gap-2 text-xs font-bold uppercase tracking-wider h-10 border-border hover:bg-secondary"
            >
              <Printer className="h-4 w-4 text-primary" /> Download Invoice / Print
            </Button>
          </div>
        </div>

        {/* Order Status Visual Progress Tracker */}
        {!isCancelled && (
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
              Order Delivery Progress
            </h3>

            <div className="relative flex items-center justify-between max-w-3xl mx-auto pt-2">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-border -translate-y-1/2 z-0" />
              <div
                className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
                style={{
                  width: `${(currentStepIdx / (orderSteps.length - 1)) * 100}%`,
                }}
              />

              {orderSteps.map((step, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div
                    key={step.key}
                    className="relative z-10 flex flex-col items-center group cursor-default"
                  >
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 ring-4 ring-background"
                          : "bg-secondary text-muted-foreground border border-border"
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                    </div>
                    <span
                      className={`mt-2 text-[11px] font-bold uppercase tracking-wider ${
                        isCurrent
                          ? "text-primary"
                          : isPassed
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Grid: Items List + Sidebar Summaries */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Order Items */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-base font-extrabold tracking-tight text-foreground font-heading flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-primary" /> Purchased Items ({order.items.length})
                </h2>
                <span className="text-xs font-mono font-semibold text-muted-foreground">
                  Order ID: {order.orderNumber}
                </span>
              </div>

              <div className="divide-y divide-border">
                {order.items.map((item: any) => (
                  <div key={item.id} className="py-5 first:pt-0 last:pb-0 flex gap-4 sm:gap-6">
                    {/* Item Image */}
                    <div className="relative aspect-[3/4] w-20 sm:w-24 rounded-xl bg-secondary overflow-hidden border border-border shrink-0">
                      <Image
                        src={item.product?.images?.[0]?.url || "/placeholder.jpg"}
                        alt={item.product?.name || "Product"}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-4">
                          <Link
                            href={`/products/${item.product?.slug || "#"}`}
                            className="font-bold text-sm sm:text-base text-foreground hover:text-primary transition-colors line-clamp-2"
                          >
                            {item.product?.name || "Custom Apparel Product"}
                          </Link>
                          <div className="text-right shrink-0">
                            <span className="font-extrabold text-sm sm:text-base text-foreground font-heading">
                              {formatPrice(Number(item.price * item.quantity))}
                            </span>
                            {item.quantity > 1 && (
                              <p className="text-[10px] text-muted-foreground">
                                {formatPrice(Number(item.price))} each
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Variant Attributes */}
                        {item.variant && (
                          <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground font-medium">
                            {item.variant.color && (
                              <span className="px-2 py-0.5 rounded bg-secondary border border-border text-[11px]">
                                Color: <strong className="text-foreground">{item.variant.color}</strong>
                              </span>
                            )}
                            {item.variant.size && (
                              <span className="px-2 py-0.5 rounded bg-secondary border border-border text-[11px]">
                                Size: <strong className="text-foreground">{item.variant.size}</strong>
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded bg-secondary border border-border text-[11px]">
                              Qty: <strong className="text-foreground">{item.quantity}</strong>
                            </span>
                          </div>
                        )}

                        {/* Custom Measurement Profile Badge */}
                        {item.measurementProfile && (
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                            <Ruler className="h-3.5 w-3.5" />
                            <span>Custom Tailored Fit: {item.measurementProfile.name}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 text-[11px] text-muted-foreground flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Verified Store Item</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Delivery Details Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Order Summary Box */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-foreground font-heading border-b border-border pb-3">
                Order Financial Summary
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-foreground">{formatPrice(Number(order.subtotal))}</span>
                </div>

                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-emerald-500 font-semibold">
                    <span>Discount {order.coupon ? `(${order.coupon.code})` : ""}</span>
                    <span>-{formatPrice(Number(order.discount))}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted-foreground">
                  <span>Taxes & GST</span>
                  <span className="font-semibold text-foreground">{formatPrice(Number(order.tax))}</span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping Fee</span>
                  <span className="font-semibold text-foreground">
                    {Number(order.shipping) > 0 ? formatPrice(Number(order.shipping)) : "FREE"}
                  </span>
                </div>

                <div className="border-t border-border pt-3 mt-3 flex justify-between items-center">
                  <span className="font-bold text-sm uppercase tracking-wider text-foreground">
                    Total Amount
                  </span>
                  <span className="font-black text-lg text-primary font-heading">
                    {formatPrice(Number(order.total))}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Address Box */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-foreground font-heading flex items-center gap-2 border-b border-border pb-3">
                <MapPin className="h-4 w-4 text-primary" /> Delivery Details
              </h3>

              {order.shippingAddress ? (
                <div className="space-y-2 text-xs leading-relaxed text-foreground">
                  <p className="font-bold text-sm flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-primary" /> {order.shippingAddress.fullName || "Customer"}
                  </p>
                  <p className="text-muted-foreground">{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && (
                    <p className="text-muted-foreground">{order.shippingAddress.addressLine2}</p>
                  )}
                  {order.shippingAddress.landmark && (
                    <p className="text-muted-foreground italic">Landmark: {order.shippingAddress.landmark}</p>
                  )}
                  <p className="text-muted-foreground">
                    {[
                      order.shippingAddress.city,
                      order.shippingAddress.state,
                      order.shippingAddress.country,
                    ].filter(Boolean).join(", ")}
                    {order.shippingAddress.postalCode ? ` - ${order.shippingAddress.postalCode}` : ""}
                  </p>
                  {(order.shippingAddress.phone || order.shippingAddress.mobile) && (
                    <p className="text-xs font-semibold text-foreground pt-1 flex items-center gap-1.5 font-mono">
                      <Phone className="h-3.5 w-3.5 text-primary" /> {order.shippingAddress.phone || order.shippingAddress.mobile}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground leading-relaxed">
                  {order.notes ? (
                    <p className="p-3 rounded-xl bg-secondary border border-border text-foreground font-medium">{order.notes}</p>
                  ) : (
                    <p className="italic">Customer Direct Store Delivery</p>
                  )}
                </div>
              )}
            </div>

            {/* Payment Method & Status Box */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-foreground font-heading flex items-center gap-2 border-b border-border pb-3">
                <CreditCard className="h-4 w-4 text-primary" /> Payment Method
              </h3>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-bold uppercase tracking-wider text-foreground">
                  {order.paymentMethod || "COD"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary border border-border text-foreground">
                  Payment {order.paymentStatus || "PENDING"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarIcon(props: any) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
