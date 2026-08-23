import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Choose a new password</CardTitle>
            <CardDescription>Enter a new password for your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResetPasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
