"use client";

import Link from "next/link";
import { useState } from "react";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent } from "@/components/ui/card";

import { FormInput } from "@/components/forms/form-input";
import { SubmitButton } from "@/components/forms/submit-button";
import { CountryCodePicker } from "@/components/ui/country-code-picker";
import { Label } from "@/components/ui/label";

import { registerSchema, RegisterSchema } from "@/validations/auth.validation";

import { useRegister } from "@/hooks/auth/use-register";

export default function RegisterPage() {

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema as any),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      countryCode: "+91",
      mobile: "",
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useRegister();

  const onSubmit = (data: RegisterSchema) => {
    const { confirmPassword, ...payload } = data;
    mutation.mutate(payload);
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardContent className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create Account</h1>

          <p className="mt-2 text-muted-foreground">
            Create your Kesariya account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            label="First Name"
            error={errors.firstName?.message}
            {...register("firstName")}
          />

          <FormInput
            label="Last Name"
            error={errors.lastName?.message}
            {...register("lastName")}
          />

          <FormInput
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <div className="space-y-2">
            <Label>Mobile Number</Label>
            <div className="flex gap-2">
              <Controller
                name="countryCode"
                control={control}
                render={({ field }) => (
                  <CountryCodePicker
                    value={field.value}
                    onChange={field.onChange}
                    className="w-[120px]"
                  />
                )}
              />
              <div className="flex-1">
                <FormInput
                  label=""
                  containerClassName="space-y-0"
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
            error={errors.password?.message}
            {...register("password")}
          />

          <FormInput
            label="Confirm Password"
            type="password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <SubmitButton loading={mutation.isPending}>Create Account</SubmitButton>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
