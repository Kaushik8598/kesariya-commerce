"use client";

import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { authService } from "@/services/auth.service";
import { useAuth } from "@/providers/auth-provider";

export function useVerifyRegistrationOtp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  return useMutation({
    mutationFn: authService.verifyRegistrationOtp,

    onSuccess: (response) => {
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
      toast.error(error.response?.data?.message || "Failed to verify OTP");
    },
  });
}
