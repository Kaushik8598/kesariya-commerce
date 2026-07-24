import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-lg text-xs font-bold whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 active:translate-y-px",
        outline:
          "border border-border bg-card text-foreground hover:bg-secondary active:translate-y-px",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:translate-y-px",
        ghost:
          "text-muted-foreground hover:bg-secondary hover:text-foreground active:translate-y-px",
        destructive:
          "bg-destructive/15 text-destructive border border-destructive/25 hover:bg-destructive/25 active:translate-y-px",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 gap-2",
        xs: "h-6 px-2.5 text-[11px] rounded-md gap-1",
        sm: "h-8 px-3 text-xs rounded-md gap-1.5",
        lg: "h-11 px-6 text-sm rounded-xl gap-2",
        icon: "size-8 rounded-lg",
        "icon-sm": "size-7 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
