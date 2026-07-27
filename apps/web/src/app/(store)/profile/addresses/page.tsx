"use client";

import { useState } from "react";
import { useAddresses, useDeleteAddress } from "@/hooks/profile/use-profile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Plus, Trash2, Edit2 } from "lucide-react";
import { AddressForm } from "@/components/profile/address-form";

export default function AddressesPage() {
  const { data: addresses, isLoading } = useAddresses();
  const { mutate: deleteAddress, isPending: isDeleting } = useDeleteAddress();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="border border-border rounded-2xl p-6 md:p-8 bg-card shadow-sm space-y-6">
        <Skeleton className="h-8 w-44 mb-4" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="border border-border rounded-2xl p-6 md:p-8 bg-card shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-wider font-heading text-foreground">
              Saved Addresses
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              Manage your shipping and billing delivery addresses.
            </p>
          </div>
        </div>
        {!isAddingNew && !editingAddress && (
          <Button
            size="sm"
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
          >
            <Plus className="h-4 w-4" /> Add New
          </Button>
        )}
      </div>

      {isAddingNew ? (
        <AddressForm
          onSuccess={() => setIsAddingNew(false)}
          onCancel={() => setIsAddingNew(false)}
        />
      ) : editingAddress ? (
        <AddressForm
          key={editingAddress.id}
          initialData={editingAddress}
          onSuccess={() => setEditingAddress(null)}
          onCancel={() => setEditingAddress(null)}
        />
      ) : addresses && addresses.length > 0 ? (
        <div className="space-y-4">
          {addresses.map((address: any) => (
            <div
              key={address.id}
              className="flex items-start justify-between p-5 border border-border rounded-xl bg-secondary/10 transition-all hover:border-foreground/20"
            >
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="text-xs space-y-1 text-foreground leading-relaxed">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm">{address.fullName}</p>
                    {address.isDefault && (
                      <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider uppercase border border-primary/20">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground">{address.addressLine1}</p>
                  {address.addressLine2 && (
                    <p className="text-muted-foreground">{address.addressLine2}</p>
                  )}
                  {address.landmark && (
                    <p className="text-muted-foreground italic">Landmark: {address.landmark}</p>
                  )}
                  <p className="text-muted-foreground">
                    {[
                      address.city?.name || address.city,
                      address.state?.name || address.state,
                      address.country?.name || address.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                    {address.postalCode ? ` - ${address.postalCode}` : ""}
                  </p>
                  <p className="text-muted-foreground pt-1 font-mono">
                    Phone: {address.phoneCode ? `${address.phoneCode} ` : ""}{address.mobile}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setEditingAddress(address)}
                  className="h-8 w-8 text-muted-foreground hover:text-primary hover:border-primary/40"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => deleteAddress(address.id)}
                  disabled={isDeleting}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 max-w-sm mx-auto">
          <div className="h-16 w-16 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-4 text-muted-foreground mx-auto">
            <MapPin className="h-8 w-8 opacity-60" />
          </div>
          <p className="text-xs text-muted-foreground mb-4">You haven't saved any addresses yet.</p>
          <Button onClick={() => setIsAddingNew(true)} className="text-xs font-bold uppercase tracking-wider">
            Add Your First Address
          </Button>
        </div>
      )}
    </div>
  );
}
