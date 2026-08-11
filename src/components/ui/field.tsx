import { cn } from "@/lib/cn";
import type { LabelHTMLAttributes, SelectHTMLAttributes, InputHTMLAttributes } from "react";
import { forwardRef } from "react";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400", className)}
      {...props}
    />
  );
}

export const inputClass =
  "w-full rounded-xl border border-ink-700 bg-ink-800/70 px-3.5 py-3 text-sm text-ink-50 outline-none transition-colors placeholder:text-ink-500 focus:border-volt-300/60 focus:ring-1 focus:ring-volt-300/40";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, ...props }, ref) {
    return <select ref={ref} className={cn(inputClass, "appearance-none", className)} {...props} />;
  }
);

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(inputClass, className)} {...props} />;
  }
);
