"use client";

import { useAddresses, useDeleteAddress, useProfile } from "@/hooks/profile/use-profile";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Plus, Trash2, Edit2, LogOut, Loader2, User, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AddressForm } from "@/components/profile/address-form";


export default function AddressesPage() {
  const { isAuthenticated, logout } = useAuth();
  const { data: addresses, isLoading } = useAddresses();
  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const { mutate: deleteAddress, isPending: isDeleting } = useDeleteAddress();

  const router = useRouter();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black tracking-widest uppercase mb-10">My Profile</h1>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:py-20 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-black tracking-widest uppercase">My Profile</h1>
        <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20">
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Sidebar */}
        <div className="md:col-span-4 space-y-6">
          <div className="border border-border rounded-xl p-6 bg-secondary/10 text-center flex flex-col items-center">
            <div className="h-24 w-24 bg-foreground/10 rounded-full flex items-center justify-center mb-4">
              <User className="h-10 w-10 text-foreground/50" />
            </div>
            <h2 className="text-xl font-black tracking-widest uppercase mb-1">
              {profile?.firstName} {profile?.lastName}
            </h2>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/60">
              <Shield className="h-3 w-3" /> {profile?.role?.name || "Customer"}
            </div>
          </div>

          <div className="border border-border rounded-xl p-2 bg-secondary/10 flex flex-col gap-1">
            <Link href="/profile" className="px-4 py-3 hover:bg-secondary/30 rounded-lg text-sm font-bold uppercase tracking-widest text-foreground/70 transition-colors">
              Profile Details
            </Link>
            <Link href="/profile/addresses" className="px-4 py-3 bg-secondary/50 rounded-lg text-sm font-bold uppercase tracking-widest">
              Saved Addresses
            </Link>
            <Link href="/profile/measurements" className="px-4 py-3 hover:bg-secondary/30 rounded-lg text-sm font-bold uppercase tracking-widest text-foreground/70 transition-colors">
              Measurements
            </Link>
            <Link href="/orders" className="px-4 py-3 hover:bg-secondary/30 rounded-lg text-sm font-bold uppercase tracking-widest text-foreground/70 transition-colors">
              Order History
            </Link>
            <Link href="/profile/password" className="px-4 py-3 hover:bg-secondary/30 rounded-lg text-sm font-bold uppercase tracking-widest text-foreground/70 transition-colors">
              Password
            </Link>
            <Link href="/profile/notifications" className="px-4 py-3 hover:bg-secondary/30 rounded-lg text-sm font-bold uppercase tracking-widest text-foreground/70 transition-colors">
              Notifications
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="md:col-span-8">
          <div className="border border-border rounded-xl p-6 md:p-8">
            <div className="flex items-center justify-between border-b border-border pb-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-widest">Saved Addresses</h2>
                  <p className="text-sm text-foreground/60">Manage your shipping and billing addresses.</p>
                </div>
              </div>
              {!isAddingNew && !editingAddress && (
                <Button size="sm" onClick={() => setIsAddingNew(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add New
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : isAddingNew ? (
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
                  <div key={address.id} className="flex justify-between p-4 border border-border rounded-lg bg-background">
                    <div className="flex gap-4">
                      <MapPin className="h-5 w-5 text-primary mt-1" />
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold">{address.fullName}</p>
                          {address.isDefault && <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold tracking-widest uppercase">Default</span>}
                        </div>
                        <p>{address.addressLine1}</p>
                        {address.addressLine2 && <p>{address.addressLine2}</p>}
                        <p>{address.city?.name || address.cityId}, {address.state?.name || address.stateId} {address.postalCode}</p>
                        <p className="text-foreground/60">Phone: {address.phoneCode} {address.mobile}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="icon" onClick={() => setEditingAddress(address)} className="h-8 w-8 hover:text-primary">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => deleteAddress(address.id)} disabled={isDeleting} className="h-8 w-8 hover:text-destructive hover:border-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <MapPin className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
                <p className="text-foreground/60 mb-4">You haven't saved any addresses yet.</p>
                <Button onClick={() => setIsAddingNew(true)}>Add Your First Address</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

