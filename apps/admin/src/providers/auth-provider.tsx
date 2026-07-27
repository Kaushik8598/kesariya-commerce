"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authStorage } from "@/lib/auth-storage";
import api from "@/lib/api";

interface Role {
  id: string;
  name: string;
  slug: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  countryCode: string;
  mobile: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const ALLOWED_ROLES = ["admin", "super-admin"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasToken = typeof window !== "undefined" && !!authStorage.getAccessToken();

  const {
    data: user,
    isLoading: isQueryLoading,
    isError,
  } = useQuery<User>({
    queryKey: ["currentAdminUser"],
    queryFn: async () => {
      const response = await api.get("/auth/me");
      const userData = response.data;
      if (!userData?.role?.slug || !ALLOWED_ROLES.includes(userData.role.slug)) {
        throw new Error("Access denied: Not an admin");
      }
      return userData;
    },
    enabled: mounted && hasToken,
    retry: false,
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (isError) {
      authStorage.clear();
      queryClient.setQueryData(["currentAdminUser"], null);
    }
  }, [isError, queryClient]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const refreshToken = authStorage.getRefreshToken();
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    },
    onSettled: () => {
      authStorage.clear();
      queryClient.setQueryData(["currentAdminUser"], null);
      queryClient.clear();
      router.push("/login");
    },
  });

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    authStorage.setAccessToken(accessToken);
    authStorage.setRefreshToken(refreshToken);
    queryClient.setQueryData(["currentAdminUser"], userData);
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  const isAuthenticated = !!user && ALLOWED_ROLES.includes(user.role?.slug);
  const isLoading = !mounted || (hasToken && isQueryLoading);

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
