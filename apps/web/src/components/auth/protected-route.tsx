"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  const isAuthorized = !allowedRoles || (user && allowedRoles.includes(user.role.slug));

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (!isAuthorized) {
        toast.error("You do not have permission to access this page");
        router.replace("/");
      }
    }
  }, [isLoading, isAuthenticated, isAuthorized, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-950 dark:border-zinc-800 dark:border-t-zinc-50" />
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
