"use client";

import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { authService } from "@/services/auth.service";

export function useForgotPassword() {
  return useMutation({
    mutationFn: authService.forgotPassword,

    onSuccess: (response) => {
      toast.success(response.data.message);
    },
  });
}
