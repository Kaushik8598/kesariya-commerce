"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  mobile: string;
  role: { id: string; name: string; slug: string };
}

interface AuthState {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (accessToken: string, refreshToken: string, user: AdminUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ALLOWED_ROLES = ["admin", "super-admin"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("admin_user");
    const token = localStorage.getItem("admin_access_token");

    if (storedUser && token) {
      try {
        const user: AdminUser = JSON.parse(storedUser);
        if (ALLOWED_ROLES.includes(user.role.slug)) {
          setState({ user, isLoading: false, isAuthenticated: true });
          return;
        }
      } catch {}
    }

    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  const login = useCallback(
    (accessToken: string, refreshToken: string, user: AdminUser) => {
      localStorage.setItem("admin_access_token", accessToken);
      localStorage.setItem("admin_refresh_token", refreshToken);
      localStorage.setItem("admin_user", JSON.stringify(user));
      setState({ user, isLoading: false, isAuthenticated: true });
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    localStorage.removeItem("admin_access_token");
    localStorage.removeItem("admin_refresh_token");
    localStorage.removeItem("admin_user");
    setState({ user: null, isLoading: false, isAuthenticated: false });
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
