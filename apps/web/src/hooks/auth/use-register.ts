"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { authService } from "@/services/auth.service";

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: authService.register,

    onSuccess: (response, variables) => {
      toast.success(response.data.message);

      if (response.data.requiresVerification) {
        router.push(
          `/verify-account?countryCode=${encodeURIComponent(
            variables.countryCode,
          )}&mobile=${variables.mobile}`,
        );
      } else {
        router.push("/");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Registration failed");
    },
  });
}
