import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  phone: z.string().min(8, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  chapterId: z.string().uuid("Select a chapter"),
  preferredZoneIds: z.array(z.string().uuid()).min(1, "Select at least one area"),
  hasTransport: z.boolean(),
  transportType: z.enum([
    "no_vehicle", "bicycle", "two_wheeler", "car", "suv", "van", "commercial_vehicle", "other",
  ]),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string().min(8, "At least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
