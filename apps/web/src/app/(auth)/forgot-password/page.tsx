"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";

import { FormInput } from "@/components/forms/form-input";
import { SubmitButton } from "@/components/forms/submit-button";

import {
  forgotPasswordSchema,
  ForgotPasswordSchema,
} from "@/validations/auth.validation";

import { useForgotPassword } from "@/hooks/auth/use-forgot-password";

export default function ForgotPasswordPage() {
  const mutation = useForgotPassword();

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),

    defaultValues: {
      countryCode: "+91",
      mobile: "",
    },
  });

  const onSubmit = (data: ForgotPasswordSchema) => {
    mutation.mutate(data, {
      onSuccess: () => {
        router.push(
          `/verify-otp?countryCode=${encodeURIComponent(data.countryCode)}&mobile=${data.mobile}`,
        );
      },
    });
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardContent className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Forgot Password</h1>

          <p className="mt-2 text-muted-foreground">
            Enter your registered mobile number.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormInput
            label="Country Code"
            required
            error={errors.countryCode?.message}
            {...register("countryCode")}
          />

          <FormInput
            label="Mobile Number"
            required
            error={errors.mobile?.message}
            {...register("mobile")}
          />

          <SubmitButton loading={mutation.isPending}>Send OTP</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
