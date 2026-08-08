"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  MapPin,
  Star,
  ShoppingBag,
  Ruler,
  Lock,
  Bell,
  LogOut,
  Shield,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useProfile } from "@/hooks/profile/use-profile";
import { Button } from "@/components/ui/button";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout, isLoading: isAuthLoading } = useAuth();
  const { data: profile, isLoading } = useProfile();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Loading Account Profile...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <User className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-black uppercase tracking-widest mb-2 font-heading">
          Not Logged In
        </h1>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          Please login to view and manage your profile settings, saved addresses, and reviews.
        </p>
        <Link href="/login?redirectTo=/profile">
          <Button className="font-bold uppercase tracking-wider text-xs">Login Now</Button>
        </Link>
      </div>
    );
  }

  const menuItems = [
    { label: "Profile Details", href: "/profile", icon: User },
    { label: "Saved Addresses", href: "/profile/addresses", icon: MapPin },
    { label: "My Reviews", href: "/profile/reviews", icon: Star },
    { label: "Measurements", href: "/profile/measurements", icon: Ruler },
    { label: "Password", href: "/profile/password", icon: Lock },
    { label: "Notifications", href: "/profile/notifications", icon: Bell },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-16 sm:px-6 lg:px-8">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-10 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-widest uppercase font-heading text-foreground">
            My Account
          </h1>
          <p className="text-xs text-muted-foreground font-medium pt-1">
            Manage your personal profile, addresses, avatar picture, and order reviews
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 h-10 shrink-0"
        >
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
        {/* Shared Left Sidebar Navigation */}
        <div className="md:col-span-4 space-y-6">
          {/* User Info Sidebar Avatar Box */}
          <div className="border border-border rounded-2xl p-6 bg-card text-center flex flex-col items-center shadow-sm">
            <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-primary/20 ring-4 ring-primary/10 mb-3 bg-secondary flex items-center justify-center">
              {profile?.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.firstName || "User"}
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="h-9 w-9 text-muted-foreground opacity-60" />
              )}
            </div>
            <h2 className="text-lg font-black tracking-wider uppercase font-heading text-foreground">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() || "Valued Customer"
              )}
            </h2>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{profile?.email}</p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-3 rounded-full bg-secondary text-[11px] font-bold uppercase tracking-wider text-muted-foreground border border-border">
              <Shield className="h-3 w-3 text-primary" /> {profile?.role?.name || "Customer"}
            </div>
          </div>

          {/* Navigation Links List */}
          <nav className="border border-border rounded-2xl p-2 bg-card shadow-sm flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Dynamic Right Main Content */}
        <div className="md:col-span-8">{children}</div>
      </div>
    </div>
  );
}
