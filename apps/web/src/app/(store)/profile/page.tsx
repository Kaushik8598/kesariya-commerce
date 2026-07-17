"use client";

import { useState, useEffect } from "react";
import { useProfile, useUpdateProfile } from "@/hooks/profile/use-profile";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Phone, Shield, Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const { isAuthenticated, logout } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
      });
    }
  }, [profile]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <User className="h-16 w-16 text-foreground/20 mb-6" />
        <h1 className="text-2xl font-black uppercase tracking-widest mb-2">Not Logged In</h1>
        <p className="text-foreground/60 mb-8 max-w-md">Please login to view and manage your profile.</p>
        <Link href="/login?redirectTo=/profile">
          <Button>Login Now</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black tracking-widest uppercase mb-10">My Profile</h1>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

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
            <Link href="/profile" className="px-4 py-3 bg-secondary/50 rounded-lg text-sm font-bold uppercase tracking-widest">
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
            <Link href="/profile/notifications" className="px-4 py-3 hover:bg-secondary/30 rounded-lg text-sm font-bold uppercase tracking-widest text-foreground/70 transition-colors">
              Notifications
            </Link>
          </div>
        </div>

        <div className="md:col-span-8">
          <div className="border border-border rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-3 border-b border-border pb-6 mb-6">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-widest">Personal Information</h2>
                <p className="text-sm text-foreground/60">Update your account details and contact information.</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-foreground/70 mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-background border border-border px-4 py-3 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-foreground/70 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-background border border-border px-4 py-3 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-foreground/70 mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email Address
                </label>
                <input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="w-full bg-secondary/50 border border-border px-4 py-3 text-sm rounded-md text-foreground/60 cursor-not-allowed"
                />
                <p className="text-[10px] text-foreground/50 mt-1 uppercase tracking-widest">Email address cannot be changed.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-foreground/70 mb-2 flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone Number
                </label>
                <input
                  type="text"
                  value={profile?.mobile ? `${profile.countryCode} ${profile.mobile}` : ""}
                  disabled
                  className="w-full bg-secondary/50 border border-border px-4 py-3 text-sm rounded-md text-foreground/60 cursor-not-allowed"
                />
              </div>

              <div className="pt-6 border-t border-border">
                <Button 
                  type="submit" 
                  disabled={isUpdating || (!formData.firstName && !formData.lastName)}
                  className="w-full sm:w-auto px-8"
                >
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

