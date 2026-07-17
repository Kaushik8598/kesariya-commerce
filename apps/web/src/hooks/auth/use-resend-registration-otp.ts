"use client";

import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";

export function useResendRegistrationOtp() {
  return useMutation({
    mutationFn: authService.resendRegistrationOtp,

    onSuccess: (response) => {
      toast.success(response.data.message);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    },
  });
}
