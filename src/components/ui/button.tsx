import { cn } from "@/lib/cn";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary: "bg-brand-600 text-white hover:bg-brand-500 active:bg-brand-700 shadow-card active:scale-[0.98]",
  secondary: "bg-ink-800 text-ink-50 border border-ink-700 hover:bg-ink-700 active:scale-[0.98]",
  outline: "border border-ink-600 text-ink-100 hover:bg-ink-800 active:scale-[0.98]",
  ghost: "text-ink-200 hover:bg-ink-800/70 active:scale-[0.98]",
  danger: "bg-cardred/10 text-cardred border border-cardred/20 hover:bg-cardred/15 active:scale-[0.98]",
};

const sizes = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-6 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "tap-target inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
