"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useProfile, useUpdatePassword } from "@/hooks/profile/use-profile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Shield, LogOut, Key } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function PasswordPage() {
  const { isAuthenticated, logout } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { mutate: updatePassword, isPending: isUpdating } = useUpdatePassword();
  const router = useRouter();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
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
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    updatePassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    }, {
      onSuccess: () => {
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
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
            <Link href="/profile/password" className="px-4 py-3 bg-secondary/50 rounded-lg text-sm font-bold uppercase tracking-widest">
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
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-widest">Change Password</h2>
                <p className="text-sm text-foreground/60">Update your account password to stay secure.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-foreground/70 mb-2">Current Password</label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  required
                  className="w-full bg-background border border-border px-4 py-3 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-foreground/70 mb-2">New Password</label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  required
                  className="w-full bg-background border border-border px-4 py-3 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-foreground/70 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="w-full bg-background border border-border px-4 py-3 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={isUpdating} className="w-full md:w-auto px-8">
                  {isUpdating ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

