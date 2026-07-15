"use client";

import { useAddresses, useAddAddress, useDeleteAddress, useUpdateAddress, useCountries, useStates, useCities, useProfile } from "@/hooks/profile/use-profile";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Plus, Trash2, Edit2, LogOut, Loader2, User, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";


export default function AddressesPage() {
  const { isAuthenticated, logout } = useAuth();
  const { data: addresses, isLoading } = useAddresses();
  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const { mutate: addAddress, isPending: isAdding } = useAddAddress();
  const { mutate: deleteAddress, isPending: isDeleting } = useDeleteAddress();

  const router = useRouter();
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "", phoneCode: "", mobile: "", addressLine1: "", addressLine2: "",
    countryId: "", stateId: "", cityId: "", postalCode: "", isDefault: false
  });

  const { data: countries, isLoading: isCountriesLoading } = useCountries();
  const { data: states, isLoading: isStatesLoading } = useStates(formData.countryId);
  const { data: cities, isLoading: isCitiesLoading } = useCities(formData.stateId);

  useEffect(() => {
    if (formData.countryId) {
      const country = countries?.find((c: any) => c.id === formData.countryId);
      if (country && !formData.phoneCode) {
        setFormData(prev => ({ ...prev, phoneCode: country.phoneCode }));
      }
    }
  }, [formData.countryId, countries]);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.countryId || !formData.stateId || !formData.cityId) {
      toast.error("Please select country, state and city");
      return;
    }

    addAddress(formData, {
      onSuccess: () => {
        setIsAddingNew(false);
        setFormData({
          fullName: "", phoneCode: "", mobile: "", addressLine1: "", addressLine2: "",
          countryId: "", stateId: "", cityId: "", postalCode: "", isDefault: false
        });
      }
    });
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
              {!isAddingNew && (
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
              <form onSubmit={handleSubmit} className="space-y-4 border border-border p-6 rounded-lg bg-background">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-foreground/70 mb-2">Full Name</label>
                    <input required type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full bg-background border border-border px-4 py-2.5 text-sm rounded-md" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-foreground/70 mb-2">Phone Number</label>
                    <div className="flex gap-2">
                      <input required type="text" value={formData.phoneCode} readOnly className="w-20 bg-secondary/50 border border-border px-3 py-2.5 text-sm rounded-md cursor-not-allowed text-center" />
                      <input required type="text" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className="flex-1 bg-background border border-border px-4 py-2.5 text-sm rounded-md" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-foreground/70 mb-2">Address Line 1</label>
                  <input required type="text" value={formData.addressLine1} onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })} className="w-full bg-background border border-border px-4 py-2.5 text-sm rounded-md" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-foreground/70 mb-2">Address Line 2 (Optional)</label>
                  <input type="text" value={formData.addressLine2} onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })} className="w-full bg-background border border-border px-4 py-2.5 text-sm rounded-md" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-foreground/70 mb-2">Country</label>
                    <select required value={formData.countryId} onChange={(e) => setFormData({ ...formData, countryId: e.target.value, stateId: "", cityId: "" })} className="w-full bg-background border border-border px-4 py-2.5 text-sm rounded-md appearance-none">
                      <option value="" disabled>Select Country</option>
                      {countries?.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-foreground/70 mb-2">State</label>
                    <select required value={formData.stateId} onChange={(e) => setFormData({ ...formData, stateId: e.target.value, cityId: "" })} disabled={!formData.countryId} className="w-full bg-background border border-border px-4 py-2.5 text-sm rounded-md appearance-none disabled:opacity-50">
                      <option value="" disabled>Select State</option>
                      {states?.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-foreground/70 mb-2">City</label>
                    <select required value={formData.cityId} onChange={(e) => setFormData({ ...formData, cityId: e.target.value })} disabled={!formData.stateId} className="w-full bg-background border border-border px-4 py-2.5 text-sm rounded-md appearance-none disabled:opacity-50">
                      <option value="" disabled>Select City</option>
                      {cities?.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-foreground/70 mb-2">Pincode</label>
                    <input required type="text" value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} className="w-full bg-background border border-border px-4 py-2.5 text-sm rounded-md" />
                  </div>
                </div>

                <label className="flex items-center gap-2 mt-4 cursor-pointer">
                  <input type="checkbox" checked={formData.isDefault} onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })} className="accent-primary" />
                  <span className="text-sm font-medium">Set as default address</span>
                </label>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddingNew(false)}>Cancel</Button>
                  <Button type="submit" disabled={isAdding}>
                    {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Address
                  </Button>
                </div>
              </form>
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
                      <Button variant="outline" size="icon" className="h-8 w-8 hover:text-primary">
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
