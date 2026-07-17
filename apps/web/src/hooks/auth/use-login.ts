"use client";

import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { authService } from "@/services/auth.service";
import { useAuth } from "@/providers/auth-provider";

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  return useMutation({
    mutationFn: authService.login,

    onSuccess: (response, variables) => {
      if (response.data.requiresVerification) {
        toast.error(response.data.message);
        router.push(
          `/verify-account?countryCode=${encodeURIComponent(
            variables.countryCode,
          )}&mobile=${variables.mobile}`,
        );
        return;
      }

      login(
        response.data.accessToken,
        response.data.refreshToken,
        response.data.user,
      );

      toast.success(response.data.message);

      const redirectTo = searchParams.get("redirectTo") || "/";
      router.push(redirectTo);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Login failed");
    },
  });
}
