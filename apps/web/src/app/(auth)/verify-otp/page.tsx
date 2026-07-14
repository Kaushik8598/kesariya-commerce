"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { FormInput } from "@/components/forms/form-input";
import { SubmitButton } from "@/components/forms/submit-button";

import {
  verifyForgotPasswordOtpSchema,
  VerifyForgotPasswordOtpSchema,
} from "@/validations/auth.validation";

import { useVerifyForgotPasswordOtp } from "@/hooks/auth/use-verify-forgot-password-otp";
import { useForgotPassword } from "@/hooks/auth/use-forgot-password";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const countryCode = searchParams.get("countryCode") ?? "";
  const mobile = searchParams.get("mobile") ?? "";

  const verifyMutation = useVerifyForgotPasswordOtp();
  const resendMutation = useForgotPassword();

  const [seconds, setSeconds] = useState(30);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyForgotPasswordOtpSchema>({
    resolver: zodResolver(verifyForgotPasswordOtpSchema as any),
    defaultValues: {
      countryCode,
      mobile,
      otp: "",
    },
  });

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const onSubmit = (data: VerifyForgotPasswordOtpSchema) => {
    verifyMutation.mutate(data, {
      onSuccess: () => {
        router.push(
          `/reset-password?countryCode=${encodeURIComponent(countryCode)}&mobile=${mobile}&otp=${data.otp}`,
        );
      },
    });
  };

  const resendOtp = () => {
    resendMutation.mutate(
      {
        countryCode: "+91",
        mobile,
      },
      {
        onSuccess: () => {
          setSeconds(30);
        },
      },
    );
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardContent className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Verify OTP</h1>

          <p className="mt-2 text-muted-foreground">
            Enter the OTP sent to your mobile.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormInput
            label="OTP"
            required
            maxLength={6}
            error={errors.otp?.message}
            {...register("otp")}
          />

          <SubmitButton loading={verifyMutation.isPending}>
            Verify OTP
          </SubmitButton>
        </form>

        <div className="mt-5 text-center">
          {seconds > 0 ? (
            <p className="text-sm text-muted-foreground">
              Resend OTP in {seconds}s
            </p>
          ) : (
            <Button
              variant="link"
              onClick={resendOtp}
              disabled={resendMutation.isPending}
            >
              Resend OTP
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-black">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-950 dark:border-zinc-800 dark:border-t-zinc-50" />
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
