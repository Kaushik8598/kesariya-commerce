"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";

import { FormInput } from "@/components/forms/form-input";
import { SubmitButton } from "@/components/forms/submit-button";
import { CountryCodePicker } from "@/components/ui/country-code-picker";
import { Label } from "@/components/ui/label";

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
    control,
    formState: { errors },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema as any),

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
              <p className="text-sm text-destructive">{errors.countryCode?.message}</p>
            )}
          </div>

          <SubmitButton loading={mutation.isPending}>Send OTP</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
