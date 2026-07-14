"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { authService } from "@/services/auth.service";
import { authStorage } from "@/lib/auth";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: authService.login,

    onSuccess: (response) => {
      authStorage.setAccessToken(response.data.accessToken);
      authStorage.setRefreshToken(response.data.refreshToken);

      toast.success(response.data.message);

      router.push("/");
    },
  });
}
