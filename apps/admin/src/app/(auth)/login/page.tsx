"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Store, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { Suspense } from "react";

const loginSchema = z.object({
  countryCode: z.string().default("+91"),
  mobile: z.string().min(10, "Enter a valid mobile number"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

const ALLOWED_ROLES = ["admin", "super-admin"];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const redirectTo = searchParams.get("redirectTo") || "/";

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema as any),
    defaultValues: { countryCode: "+91", mobile: "", password: "" },
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError("");
    try {
      const res = await api.post("/auth/login", data);
      const resData = res.data;
      const { accessToken, refreshToken, user } = resData;

      if (!user?.role?.slug || !ALLOWED_ROLES.includes(user.role.slug)) {
        setServerError("Access denied. Admin privileges required.");
        return;
      }

      login(accessToken, refreshToken, user);
      toast.success(`Welcome back, ${user.firstName}!`);
      router.push(redirectTo);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setServerError(Array.isArray(msg) ? msg[0] : msg || "Invalid credentials");
    }
  };

  return (
    <div
      style={{
        background: "var(--background-secondary)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "40px 36px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <div
          style={{
            width: 44,
            height: 44,
            background: "var(--primary)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Store size={22} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "var(--foreground)" }}>Kesariya</div>
          <div style={{ fontSize: 12, color: "var(--foreground-muted)" }}>Admin Dashboard</div>
        </div>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: "var(--foreground)" }}>
        Sign in to your account
      </h1>
      <p style={{ fontSize: 13.5, color: "var(--foreground-muted)", marginBottom: 28 }}>
        Admin access only. Enter your credentials to continue.
      </p>

      {serverError && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            background: "var(--danger-muted)",
            border: "1px solid var(--danger)",
            borderRadius: 8,
            marginBottom: 20,
            color: "var(--danger)",
            fontSize: 13,
          }}
        >
          <AlertCircle size={15} />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Mobile */}
        <div>
          <label
            style={{ display: "block", fontSize: 12.5, fontWeight: 500, color: "var(--foreground-muted)", marginBottom: 6 }}
          >
            Mobile Number
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              {...register("countryCode")}
              style={{
                width: 72,
                padding: "9px 12px",
                background: "var(--surface)",
                border: `1px solid ${errors.mobile ? "var(--danger)" : "var(--border)"}`,
                borderRadius: 8,
                color: "var(--foreground)",
                fontSize: 13.5,
                outline: "none",
              }}
            />
            <input
              {...register("mobile")}
              type="tel"
              placeholder="9999999999"
              style={{
                flex: 1,
                padding: "9px 14px",
                background: "var(--surface)",
                border: `1px solid ${errors.mobile ? "var(--danger)" : "var(--border)"}`,
                borderRadius: 8,
                color: "var(--foreground)",
                fontSize: 13.5,
                outline: "none",
              }}
            />
          </div>
          {errors.mobile && (
            <p style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>{errors.mobile.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            style={{ display: "block", fontSize: 12.5, fontWeight: 500, color: "var(--foreground-muted)", marginBottom: 6 }}
          >
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "9px 40px 9px 14px",
                background: "var(--surface)",
                border: `1px solid ${errors.password ? "var(--danger)" : "var(--border)"}`,
                borderRadius: 8,
                color: "var(--foreground)",
                fontSize: 13.5,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--foreground-muted)",
                display: "flex",
              }}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && (
            <p style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: "11px",
            background: isSubmitting ? "var(--surface)" : "var(--primary)",
            color: "white",
            border: "none",
            borderRadius: 9,
            fontWeight: 600,
            fontSize: 14,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 4,
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ height: 400, background: "var(--surface)", borderRadius: 16 }} />}>
      <LoginContent />
    </Suspense>
  );
}
