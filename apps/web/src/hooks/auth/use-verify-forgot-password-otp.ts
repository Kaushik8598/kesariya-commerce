"use client";

import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { authService } from "@/services/auth.service";

export function useVerifyForgotPasswordOtp() {
  return useMutation({
    mutationFn: authService.verifyForgotPasswordOtp,

    onSuccess: (response) => {
      toast.success(response.data.message);
    },
  });
}
