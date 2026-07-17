import { api } from "@/lib/axios";

import type {
  LoginSchema,
  RegisterSchema,
  ForgotPasswordSchema,
  VerifyForgotPasswordOtpSchema,
  ResetPasswordSchema,
  VerifyRegistrationOtpSchema,
  ResendRegistrationOtpSchema,
} from "@/validations/auth.validation";

export const authService = {
  register: (data: Omit<RegisterSchema, "confirmPassword">) => api.post("/auth/register", data),

  login: (data: LoginSchema) => api.post("/auth/login", data),

  forgotPassword: (data: ForgotPasswordSchema) =>
    api.post("/auth/forgot-password", data),

  verifyForgotPasswordOtp: (data: VerifyForgotPasswordOtpSchema) =>
    api.post("/auth/verify-forgot-password-otp", data),

  resetPassword: (data: Omit<ResetPasswordSchema, "confirmPassword">) =>
    api.post("/auth/reset-password", data),

  verifyRegistrationOtp: (data: VerifyRegistrationOtpSchema) =>
    api.post("/auth/verify-registration-otp", data),

  resendRegistrationOtp: (data: ResendRegistrationOtpSchema) =>
    api.post("/auth/resend-registration-otp", data),

  me: () => api.get("/auth/me"),

  refresh: (refreshToken: string) =>
    api.post("/auth/refresh", {
      refreshToken,
    }),

  logout: (refreshToken: string) =>
    api.post("/auth/logout", {
      refreshToken,
    }),

  logoutAll: () => api.post("/auth/logout-all"),
};
