"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent } from "@/components/ui/card";

import { FormInput } from "@/components/forms/form-input";
import { SubmitButton } from "@/components/forms/submit-button";

import {
  resetPasswordSchema,
  ResetPasswordSchema,
} from "@/validations/auth.validation";

import { useResetPassword } from "@/hooks/auth/use-reset-password";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mutation = useResetPassword();

  const countryCode = searchParams.get("countryCode") ?? "";
  const mobile = searchParams.get("mobile") ?? "";
  const otp = searchParams.get("otp") ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),

    defaultValues: {
      countryCode,
      mobile,
      otp,
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ResetPasswordSchema) => {
    const { confirmPassword, ...payload } = data;

    mutation.mutate(payload, {
      onSuccess: () => {
        router.replace("/login");
      },
    });
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardContent className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Reset Password</h1>

          <p className="mt-2 text-muted-foreground">
            Create a new password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormInput
            label="New Password"
            type="password"
            required
            error={errors.password?.message}
            {...register("password")}
          />

          <FormInput
            label="Confirm Password"
            type="password"
            required
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <SubmitButton loading={mutation.isPending}>
            Reset Password
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
