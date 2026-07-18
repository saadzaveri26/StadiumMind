import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-label-bold text-label-bold transition-all duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-touch-target-min min-w-touch-target-min px-4 py-2 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-tertiary text-on-tertiary shadow-[0_0_15px_rgba(233,195,73,0.1)] hover:bg-tertiary-fixed",
        secondary:
          "bg-primary-container text-on-primary-container border border-tertiary/30 hover:bg-tertiary hover:text-on-tertiary",
        outline:
          "border border-outline-variant bg-surface-container-low text-on-surface-variant hover:bg-surface-variant hover:text-on-surface hover:border-tertiary/30",
        ghost: "hover:bg-primary-container text-primary hover:text-on-primary-container",
        icon: "p-2 rounded-full text-on-surface-variant hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center",
      },
      size: {
        default: "h-touch-target-min px-6 py-3",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-14 rounded-lg px-8",
        icon: "h-touch-target-min w-touch-target-min p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
