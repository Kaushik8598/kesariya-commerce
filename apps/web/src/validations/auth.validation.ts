import { z } from "zod";

export const loginSchema = z.object({
  countryCode: z.string().min(1, "Country code is required"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.email().optional().or(z.literal("")),
    countryCode: z.string().min(1),
    mobile: z.string().min(10),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type RegisterSchema = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  countryCode: z.string().min(1, "Country code is required"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
});
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const verifyForgotPasswordOtpSchema = z.object({
  countryCode: z.string().min(1),
  mobile: z.string().min(10),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});
export type VerifyForgotPasswordOtpSchema = z.infer<
  typeof verifyForgotPasswordOtpSchema
>;

export const resetPasswordSchema = z
  .object({
    countryCode: z.string().min(1),
    mobile: z.string().min(10),
    otp: z.string().length(6),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export const verifyRegistrationOtpSchema = z.object({
  countryCode: z.string().min(1),
  mobile: z.string().min(10),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});
export type VerifyRegistrationOtpSchema = z.infer<
  typeof verifyRegistrationOtpSchema
>;

export const resendRegistrationOtpSchema = z.object({
  countryCode: z.string().min(1, "Country code is required"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
});
export type ResendRegistrationOtpSchema = z.infer<typeof resendRegistrationOtpSchema>;
