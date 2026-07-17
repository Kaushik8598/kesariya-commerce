"use client";

import Link from "next/link";
import { useCart, useRemoveCartItem, useUpdateCartItem, useApplyCoupon, useRemoveCoupon } from "@/hooks/cart/use-cart";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Plus, Minus, Tag, X, ArrowRight, Loader2, ShoppingBag, Ruler } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const { data: cart, isLoading } = useCart();
  const { mutate: updateQuantity, isPending: isUpdating } = useUpdateCartItem();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItem();
  const { mutate: applyCoupon, isPending: isApplyingCoupon } = useApplyCoupon();
  const { mutate: removeCoupon, isPending: isRemovingCoupon } = useRemoveCoupon();

  const [couponCode, setCouponCode] = useState("");
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your Bag is Empty"
        description="Please login to view your bag."
        actionLabel="Login"
        actionHref="/login?redirectTo=/cart"
      />
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black tracking-widest uppercase mb-10">Your Bag</h1>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your Bag is Empty"
        description="Looks like you haven't added anything to your bag yet."
        actionLabel="Continue Shopping"
        actionHref="/"
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:py-20 sm:px-6 lg:px-8">
      <h1 className="text-2xl md:text-3xl font-black tracking-widest uppercase mb-8 md:mb-10">Your Bag</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <div className="space-y-6">
            {cart.items.map((item: any) => (
              <div key={item.id} className="flex gap-4 md:gap-6 border-b border-border pb-6 last:border-0">
                {/* Image */}
                <div className="relative aspect-[3/4] w-24 md:w-32 flex-shrink-0 bg-secondary/50 rounded-sm overflow-hidden">
                  <Image
                    src={item.product.images?.[0]?.url || "/placeholder.jpg"}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <Link href={`/products/${item.product.slug}`} className="font-bold text-sm md:text-base hover:text-primary transition-colors line-clamp-2">
                        {item.product.name}
                      </Link>
                      <p className="font-bold whitespace-nowrap">₹{Number(item.price).toFixed(2)}</p>
                    </div>

                    {item.variant && (
                      <div className="mt-1 flex gap-2 text-xs text-foreground/60 uppercase tracking-widest">
                        {item.variant.color && <span>{item.variant.color}</span>}
                        {item.variant.color && item.variant.size && <span>|</span>}
                        {item.variant.size && <span>{item.variant.size}</span>}
                      </div>
                    )}

                    {item.measurementProfile && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-primary font-bold uppercase tracking-widest bg-primary/10 w-fit px-2 py-1 rounded-sm">
                        <Ruler className="h-3 w-3" />
                        <span>Fit: {item.measurementProfile.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-end justify-between mt-4">
                    {/* Quantity */}
                    <div className="flex items-center border border-border rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity({ itemId: item.id, quantity: item.quantity - 1 })}
                        disabled={isUpdating || item.quantity <= 1}
                        className="h-8 w-8 rounded-none rounded-l-md"
                      >
                        <Minus className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                      <span className="w-8 text-center text-xs md:text-sm font-semibold">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity({ itemId: item.id, quantity: item.quantity + 1 })}
                        disabled={isUpdating}
                        className="h-8 w-8 rounded-none rounded-r-md"
                      >
                        <Plus className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </div>

                    {/* Remove */}
                    <Button
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                      disabled={isRemoving}
                      className="text-foreground/50 hover:text-destructive hover:bg-transparent h-8 px-2 flex items-center gap-1 text-xs uppercase tracking-widest font-semibold"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden md:inline">Remove</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-secondary/20 p-6 md:p-8 rounded-xl sticky top-24 border border-border/50">
            <h2 className="text-lg font-black tracking-widest uppercase mb-6">Order Summary</h2>

            <div className="space-y-4 mb-8 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground/70">Subtotal</span>
                <span className="font-semibold">₹{Number(cart.summary.subtotal).toFixed(2)}</span>
              </div>

              {cart.coupon && (
                <div className="flex justify-between text-primary font-medium">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Discount ({cart.coupon.code})
                  </span>
                  <span>-₹{Number(cart.summary.discount).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-foreground/70">Estimated Tax</span>
                <span className="font-semibold">₹{Number(cart.summary.tax).toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-foreground/70">Shipping</span>
                <span className="font-semibold">
                  {cart.summary.shipping > 0 ? `₹${Number(cart.summary.shipping).toFixed(2)}` : 'FREE'}
                </span>
              </div>

              <div className="border-t border-border pt-4 mt-4 flex justify-between">
                <span className="font-bold text-base">Total</span>
                <span className="font-black text-lg">₹{Number(cart.summary.total).toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon Section */}
            <div className="mb-8">
              {cart.coupon ? (
                <div className="flex items-center justify-between p-3 border border-primary/20 bg-primary/5 rounded-md text-sm">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <span className="font-bold uppercase tracking-widest">{cart.coupon.code} Applied</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCoupon()}
                    disabled={isRemovingCoupon}
                    className="h-6 w-6 rounded-full text-foreground/60 hover:bg-primary/10 hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Promo Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="uppercase"
                  />
                  <Button
                    variant="outline"
                    disabled={!couponCode || isApplyingCoupon}
                    onClick={() => {
                      applyCoupon(couponCode);
                      setCouponCode("");
                    }}
                  >
                    Apply
                  </Button>
                </div>
              )}
            </div>

            <Button
              className="w-full text-xs font-bold tracking-widest uppercase h-12 flex items-center justify-center gap-2"
              onClick={() => router.push("/checkout")}
            >
              Checkout <ArrowRight className="h-4 w-4" />
            </Button>

            <p className="text-[10px] text-center text-foreground/50 mt-4 uppercase tracking-widest">
              Secure checkout. Free shipping over ₹1000.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
