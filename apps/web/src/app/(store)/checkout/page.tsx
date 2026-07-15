"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, useCheckout } from "@/hooks/cart/use-cart";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: cart, isLoading } = useCart();
  const { mutate: processCheckout, isPending: isCheckingOut } = useCheckout();

  // Simplistic checkout state for demonstration
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  if (!isAuthenticated) {
    router.push("/login?redirectTo=/checkout");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    router.push("/cart");
    return null;
  }

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    processCheckout({
      // We don't have full address management in UI yet, passing null/empty
      shippingAddressId: undefined,
      notes: notes || `Shipping to: ${shippingAddress} | Payment: ${paymentMethod}`,
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/cart" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/60 hover:text-primary mb-8 transition-colors w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Bag
      </Link>

      <h1 className="text-2xl md:text-3xl font-black tracking-widest uppercase mb-10">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7">
          <form onSubmit={handleCheckout} className="space-y-8">
            {/* Delivery Details */}
            <div className="border border-border p-6 rounded-xl">
              <h2 className="text-lg font-bold tracking-widest uppercase mb-6 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background text-xs">1</span>
                Delivery Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-foreground/70 mb-2">Full Delivery Address</label>
                  <textarea 
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    rows={3}
                    placeholder="Enter your complete address, landmark, city, state, pincode"
                    className="w-full bg-background border border-border px-4 py-3 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-foreground/70 mb-2">Delivery Instructions (Optional)</label>
                  <input 
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g. Leave at the front door"
                    className="w-full bg-background border border-border px-4 py-3 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="border border-border p-6 rounded-xl">
              <h2 className="text-lg font-bold tracking-widest uppercase mb-6 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background text-xs">2</span>
                Payment
              </h2>
              
              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-4 border rounded-md cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="cod" 
                    checked={paymentMethod === 'cod'} 
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-primary"
                  />
                  <div>
                    <p className="font-bold">Cash on Delivery</p>
                    <p className="text-xs text-foreground/60">Pay when your order arrives</p>
                  </div>
                </label>
                
                <label className={`flex items-center gap-4 p-4 border rounded-md cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="online" 
                    checked={paymentMethod === 'online'} 
                    onChange={() => setPaymentMethod('online')}
                    className="accent-primary"
                  />
                  <div>
                    <p className="font-bold">Online Payment</p>
                    <p className="text-xs text-foreground/60">UPI, Cards, NetBanking (Coming Soon)</p>
                  </div>
                </label>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isCheckingOut || !shippingAddress || paymentMethod === 'online'}
              className="w-full h-14 text-sm font-black tracking-widest uppercase"
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : paymentMethod === 'online' ? (
                'Online Payments Coming Soon'
              ) : (
                'Place Order'
              )}
            </Button>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-5">
          <div className="bg-secondary/30 p-6 rounded-xl border border-border/50 sticky top-24">
            <h3 className="font-black tracking-widest uppercase mb-6 text-lg">In Your Bag</h3>
            
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 mb-6">
              {cart.items.map((item: any) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative aspect-[3/4] w-16 flex-shrink-0 bg-secondary/50 rounded-sm overflow-hidden">
                    <Image
                      src={item.product.images?.[0]?.url || "/placeholder.jpg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="font-bold text-sm line-clamp-1">{item.product.name}</p>
                    <div className="text-xs text-foreground/60 mt-1 uppercase tracking-widest">
                      Qty: {item.quantity} 
                      {item.variant?.color && ` | ${item.variant.color}`}
                      {item.variant?.size && ` | ${item.variant.size}`}
                    </div>
                    <p className="font-bold text-sm mt-1">₹{Number(item.price).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-6 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground/70">Subtotal</span>
                <span className="font-semibold">₹{Number(cart.summary.subtotal).toFixed(2)}</span>
              </div>
              
              {cart.coupon && (
                <div className="flex justify-between text-primary font-medium">
                  <span>Discount ({cart.coupon.code})</span>
                  <span>-₹{Number(cart.summary.discount).toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-foreground/70">Taxes</span>
                <span className="font-semibold">₹{Number(cart.summary.tax).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-foreground/70">Shipping</span>
                <span className="font-semibold">
                  {cart.summary.shipping > 0 ? `₹${Number(cart.summary.shipping).toFixed(2)}` : 'FREE'}
                </span>
              </div>
              
              <div className="border-t border-border pt-4 flex justify-between">
                <span className="font-bold text-base uppercase tracking-widest">Total to Pay</span>
                <span className="font-black text-xl">₹{Number(cart.summary.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
