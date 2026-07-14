"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { authStorage } from "@/lib/auth";
import { authService } from "@/services/auth.service";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  countryCode: string;
  mobile: string;
  role: {
    id: string;
    name: string;
    slug: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await authService.me();
      return response.data;
    },
    enabled: mounted && hasToken,
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });

  // If error occurs, clear tokens
  useEffect(() => {
    if (isError) {
      authStorage.clear();
      queryClient.setQueryData(["currentUser"], null);
    }
  }, [isError, queryClient]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const refreshToken = authStorage.getRefreshToken();
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    },
    onSettled: () => {
      authStorage.clear();
      queryClient.setQueryData(["currentUser"], null);
      queryClient.clear();
      router.push("/login");
    },
  });

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    authStorage.setAccessToken(accessToken);
    authStorage.setRefreshToken(refreshToken);
    queryClient.setQueryData(["currentUser"], userData);
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  const isAuthenticated = !!user;
  // Initial loading is true if we haven't mounted or if we have a token and the profile is still being loaded
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
