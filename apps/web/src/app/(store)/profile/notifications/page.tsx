"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useProfile, useUpdateNotifications } from "@/hooks/profile/use-profile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Shield, LogOut, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NotificationsPage() {
  const { isAuthenticated, logout } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateNotifications, isPending: isUpdating } = useUpdateNotifications();
  const router = useRouter();

  const [formData, setFormData] = useState({
    emailOrderUpdates: true,
    emailPromotions: false,
    smsOrderUpdates: true,
    smsPromotions: false
  });

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotifications(formData);
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
            <Link href="/profile/addresses" className="px-4 py-3 hover:bg-secondary/30 rounded-lg text-sm font-bold uppercase tracking-widest text-foreground/70 transition-colors">
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
            <Link href="/profile/notifications" className="px-4 py-3 bg-secondary/50 rounded-lg text-sm font-bold uppercase tracking-widest">
              Notifications
            </Link>
          </div>
        </div>

        <div className="md:col-span-8">
          <div className="border border-border rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-3 border-b border-border pb-6 mb-6">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-widest">Notifications</h2>
                <p className="text-sm text-foreground/60">Manage how we communicate with you.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 max-w-md">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/70 border-b border-border pb-2">Email Notifications</h3>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-1">
                    <input
                      type="checkbox"
                      checked={formData.emailOrderUpdates}
                      onChange={(e) => setFormData({ ...formData, emailOrderUpdates: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`w-10 h-5 rounded-full transition-colors ${formData.emailOrderUpdates ? 'bg-primary' : 'bg-foreground/20'}`}></div>
                    <div className={`absolute w-3.5 h-3.5 rounded-full bg-background transition-transform ${formData.emailOrderUpdates ? 'translate-x-2.5' : '-translate-x-2.5'}`}></div>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Order Updates</p>
                    <p className="text-xs text-foreground/60">Get emails about your order status and shipping.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-1">
                    <input
                      type="checkbox"
                      checked={formData.emailPromotions}
                      onChange={(e) => setFormData({ ...formData, emailPromotions: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`w-10 h-5 rounded-full transition-colors ${formData.emailPromotions ? 'bg-primary' : 'bg-foreground/20'}`}></div>
                    <div className={`absolute w-3.5 h-3.5 rounded-full bg-background transition-transform ${formData.emailPromotions ? 'translate-x-2.5' : '-translate-x-2.5'}`}></div>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Promotions & Offers</p>
                    <p className="text-xs text-foreground/60">Get emails about exclusive sales and new products.</p>
                  </div>
                </label>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/70 border-b border-border pb-2">SMS Notifications</h3>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-1">
                    <input
                      type="checkbox"
                      checked={formData.smsOrderUpdates}
                      onChange={(e) => setFormData({ ...formData, smsOrderUpdates: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`w-10 h-5 rounded-full transition-colors ${formData.smsOrderUpdates ? 'bg-primary' : 'bg-foreground/20'}`}></div>
                    <div className={`absolute w-3.5 h-3.5 rounded-full bg-background transition-transform ${formData.smsOrderUpdates ? 'translate-x-2.5' : '-translate-x-2.5'}`}></div>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Delivery Updates</p>
                    <p className="text-xs text-foreground/60">Get text messages when your order is out for delivery.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-1">
                    <input
                      type="checkbox"
                      checked={formData.smsPromotions}
                      onChange={(e) => setFormData({ ...formData, smsPromotions: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`w-10 h-5 rounded-full transition-colors ${formData.smsPromotions ? 'bg-primary' : 'bg-foreground/20'}`}></div>
                    <div className={`absolute w-3.5 h-3.5 rounded-full bg-background transition-transform ${formData.smsPromotions ? 'translate-x-2.5' : '-translate-x-2.5'}`}></div>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Promotions & Offers</p>
                    <p className="text-xs text-foreground/60">Get text messages about exclusive sales.</p>
                  </div>
                </label>
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={isUpdating} className="w-full md:w-auto px-8">
                  {isUpdating ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

