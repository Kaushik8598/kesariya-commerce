"use client";

import Link from "next/link";
import { Suspense } from "react";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent } from "@/components/ui/card";

import { FormInput } from "@/components/forms/form-input";
import { SubmitButton } from "@/components/forms/submit-button";
import { CountryCodePicker } from "@/components/ui/country-code-picker";
import { Label } from "@/components/ui/label";

import { loginSchema, LoginSchema } from "@/validations/auth.validation";

import { useLogin } from "@/hooks/auth/use-login";

function LoginContent() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema as any),
    defaultValues: {
      countryCode: "+91",
      mobile: "",
      password: "",
    },
  });

  const mutation = useLogin();

  const onSubmit = (data: LoginSchema) => {
    mutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardContent className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome Back</h1>

          <p className="mt-2 text-muted-foreground">Login to your account.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label>
              Mobile Number <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Controller
                name="countryCode"
                control={control}
                render={({ field }) => (
                  <CountryCodePicker
                    value={field.value}
                    onChange={field.onChange}
                    className="w-[120px] h-10"
                  />
                )}
              />
              <div className="flex-1">
                <FormInput
                  label=""
                  containerClassName="space-y-0"
                  className="h-10"
                  error={errors.mobile?.message}
                  {...register("mobile")}
                />
              </div>
            </div>
            {errors.countryCode?.message && (
              <p className="text-sm text-destructive">
                {errors.countryCode?.message}
              </p>
            )}
          </div>

          <FormInput
            label="Password"
            type="password"
            className="h-10"

            required
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="flex items-center justify-between">
            <Link
              href="/register"
              className="text-sm text-primary hover:underline"
            >
              Create Account
            </Link>

            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <SubmitButton loading={mutation.isPending}>Login</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-black">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-950 dark:border-zinc-800 dark:border-t-zinc-50" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
