import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, Ban } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function PendingVerificationPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.verification_status === "verified") redirect("/dashboard");

  const copy = {
    pending: {
      icon: Clock,
      title: "Your account is pending verification",
      body: "A chapter coordinator needs to verify you before you can claim or join rescues. This usually happens quickly — check back soon.",
    },
    rejected: {
      icon: Ban,
      title: "Your account wasn't verified",
      body: profile.verification_note || "Please contact your chapter coordinator for details.",
    },
    suspended: {
      icon: Ban,
      title: "Your account is suspended",
      body: profile.verification_note || "Please contact your chapter coordinator for details.",
    },
  }[profile.verification_status as "pending" | "rejected" | "suspended"];

  const Icon = copy.icon;

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-warning/15">
            <Icon className="size-6 text-warning" />
          </div>
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{copy.body}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <Link href="/" className="text-sm text-primary hover:underline">
            Back to homepage
          </Link>
          <LogoutButton variant="outline" />
        </CardContent>
      </Card>
    </div>
  );
}
