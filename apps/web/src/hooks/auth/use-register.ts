"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { authService } from "@/services/auth.service";
import { useAuth } from "@/providers/auth-provider";

export function useRegister() {
  const router = useRouter();
  const { login } = useAuth();

  return useMutation({
    mutationFn: authService.register,

    onSuccess: (response) => {
      login(
        response.data.accessToken,
        response.data.refreshToken,
        response.data.user,
      );

      toast.success(response.data.message);

      router.push("/");
    },
  });
}
