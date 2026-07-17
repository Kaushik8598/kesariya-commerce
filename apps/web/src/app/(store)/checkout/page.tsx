"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart, useCheckout } from "@/hooks/cart/use-cart";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Ruler, MapPin, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AddressForm } from "@/components/profile/address-form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAddresses } from "@/hooks/profile/use-profile";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: cart, isLoading } = useCart();
  const { mutate: processCheckout, isPending: isCheckingOut } = useCheckout();
  const { data: addresses, isLoading: isLoadingAddresses } = useAddresses();

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // Auto-select default address if available
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a: any) => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else {
        setSelectedAddressId(addresses[0].id);
      }
    }
  }, [addresses, selectedAddressId]);

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

  const handleCheckout = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    processCheckout({
      shippingAddressId: selectedAddressId || undefined,
      notes: notes || undefined,
      paymentMethod: paymentMethod === 'online' ? 'ONLINE' : 'COD',
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
          <div className="space-y-8">
            {/* Delivery Details */}
            <div className="border border-border p-6 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold tracking-widest uppercase flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background text-xs">1</span>
                  Delivery Details
                </h2>
                {!isAddingNewAddress && (
                  <Button type="button" size="sm" variant="outline" onClick={() => setIsAddingNewAddress(true)} className="flex items-center gap-2 h-8">
                    <Plus className="h-3 w-3" /> Add New
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {isLoadingAddresses ? (
                  <div className="flex h-20 items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : isAddingNewAddress ? (
                  <AddressForm
                    onSuccess={() => setIsAddingNewAddress(false)}
                    onCancel={() => setIsAddingNewAddress(false)}
                  />
                ) : addresses && addresses.length > 0 ? (
                  <RadioGroup value={selectedAddressId || ""} onValueChange={setSelectedAddressId} className="space-y-3">
                    {addresses.map((address: any) => (
                      <label
                        key={address.id}
                        htmlFor={`address-${address.id}`}
                        className={`flex items-start gap-4 p-4 border rounded-md cursor-pointer transition-all ${selectedAddressId === address.id ? 'border-primary bg-primary/5' : 'border-border'}`}
                      >
                        <RadioGroupItem
                          value={address.id}
                          id={`address-${address.id}`}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm">{address.fullName}</p>
                            {address.isDefault && <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold tracking-widest uppercase">Default</span>}
                          </div>
                          <p className="text-xs text-foreground/80 mt-1">{address.addressLine1}</p>
                          {address.addressLine2 && <p className="text-xs text-foreground/80">{address.addressLine2}</p>}
                          <p className="text-xs text-foreground/80">{address.city?.name || address.cityId}, {address.state?.name || address.stateId} {address.postalCode}</p>
                          <p className="text-xs text-foreground/60 mt-1">Phone: {address.phoneCode} {address.mobile}</p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="text-center py-6 border border-dashed border-border rounded-lg">
                    <MapPin className="h-8 w-8 text-foreground/20 mx-auto mb-3" />
                    <p className="text-sm text-foreground/60 mb-3">No saved addresses found.</p>
                    <Button type="button" onClick={() => setIsAddingNewAddress(true)}>Add Delivery Address</Button>
                  </div>
                )}

              </div>
            </div>

            {/* Delivery Instructions */}
            <div className="border border-border p-6 rounded-xl">
              <h2 className="text-lg font-bold tracking-widest uppercase mb-6 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background text-xs">2</span>
                Delivery Instructions (Optional)
              </h2>
              <Input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g. Leave at the front door"
              />
            </div>

            {/* Payment Options */}
            <div className="border border-border p-6 rounded-xl">
              <h2 className="text-lg font-bold tracking-widest uppercase mb-6 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background text-xs">3</span>
                Payment
              </h2>

              <RadioGroup value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as 'cod' | 'online')} className="space-y-3">
                <label htmlFor="payment-cod" className={`flex items-center gap-4 p-4 border rounded-md cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <RadioGroupItem
                    value="cod"
                    id="payment-cod"
                  />
                  <div>
                    <p className="font-bold">Cash on Delivery</p>
                    <p className="text-xs text-foreground/60">Pay when your order arrives</p>
                  </div>
                </label>

                <label htmlFor="payment-online" className={`flex items-center gap-4 p-4 border rounded-md cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <RadioGroupItem
                    value="online"
                    id="payment-online"
                  />
                  <div>
                    <p className="font-bold">Online Payment</p>
                    <p className="text-xs text-foreground/60">UPI, Cards, NetBanking (Coming Soon)</p>
                  </div>
                </label>
              </RadioGroup>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={isCheckingOut || !selectedAddressId || paymentMethod === 'online' || isAddingNewAddress}
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
          </div>
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
                    {item.measurementProfile && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-primary font-bold uppercase tracking-widest">
                        <Ruler className="h-3 w-3" />
                        <span>Fit: {item.measurementProfile.name}</span>
                      </div>
                    )}
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
