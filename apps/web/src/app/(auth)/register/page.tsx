"use client";

import Link from "next/link";
import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent } from "@/components/ui/card";

import { FormInput } from "@/components/forms/form-input";
import { SubmitButton } from "@/components/forms/submit-button";

import { registerSchema, RegisterSchema } from "@/validations/auth.validation";

import { useRegister } from "@/hooks/auth/use-register";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
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
    setLoading(true);
    mutation.mutate(data);
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

          <FormInput
            label="Country Code"
            error={errors.countryCode?.message}
            {...register("countryCode")}
          />

          <FormInput
            label="Mobile Number"
            error={errors.mobile?.message}
            {...register("mobile")}
          />

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

          <SubmitButton loading={loading}>Create Account</SubmitButton>

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
