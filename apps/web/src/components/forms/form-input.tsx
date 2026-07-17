"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type FormInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  containerClassName?: string;
};

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      helperText,
      required,
      type = "text",
      className,
      containerClassName,
      id,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";

    return (
      <div className={cn("space-y-2", containerClassName)}>
        <Label htmlFor={id}>
          {label}

          {required && <span className="ml-1 text-destructive">*</span>}
        </Label>

        <div className="relative mb-0.5">
          <Input
            ref={ref}
            id={id}
            type={isPassword ? (showPassword ? "text" : "password") : type}
            className={cn(
              "h-10",
              isPassword && "pr-10",
              error && "border-destructive focus-visible:ring-destructive",
              className,
            )}
            {...props}
          />

          {isPassword && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground transition hover:text-foreground hover:bg-transparent"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : helperText ? (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";
