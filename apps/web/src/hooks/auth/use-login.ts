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
  });
}
