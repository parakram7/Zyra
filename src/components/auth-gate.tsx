"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, School } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuthUser } from "@/lib/supabase/auth";
import { useZyraStore } from "@/lib/store";

// Wraps scoring/lineup/creation screens. When Supabase auth is configured,
// only a signed-in coach who belongs to an organization can reach the
// wrapped content: signed out -> sign-in prompt; signed in but no
// organization yet -> prompt to register one. In local demo mode (no
// Supabase configured) this is a no-op, so the prototype keeps working
// exactly as before.
export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthUser();
  const currentOrgId = useZyraStore((s) => s.currentOrgId);
  const hasHydrated = useZyraStore((s) => s.hasHydrated);

  if (!isSupabaseConfigured()) return <>{children}</>;
  if (user === undefined) return null; // brief auth check on load
  if (!user) return <SignInPrompt pathname={pathname} />;
  if (!hasHydrated) return null; // still resolving which org this user belongs to
  if (!currentOrgId) return <CreateOrgPrompt />;
  return <>{children}</>;
}

function SignInPrompt({ pathname }: { pathname: string }) {
  return (
    <div className="mx-auto max-w-md px-4 pt-16">
      <Card>
        <CardBody className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/15">
            <LogIn size={20} className="text-brand-400" />
          </div>
          <div>
            <p className="font-display text-base font-semibold text-ink-50">Sign in to continue</p>
            <p className="mt-1.5 text-sm text-ink-400">
              Anyone can follow along, but only a signed-in coach or scorer can build lineups,
              manage a squad, or log live events.
            </p>
          </div>
          <Link href={`/login?redirect=${encodeURIComponent(pathname)}`} className="w-full">
            <Button size="lg" className="w-full">
              Sign in
            </Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}

function CreateOrgPrompt() {
  return (
    <div className="mx-auto max-w-md px-4 pt-16">
      <Card>
        <CardBody className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/15">
            <School size={20} className="text-brand-400" />
          </div>
          <div>
            <p className="font-display text-base font-semibold text-ink-50">Register your school or club</p>
            <p className="mt-1.5 text-sm text-ink-400">
              You&apos;re signed in, but you&apos;re not part of an organization yet. Create one to
              start adding your own teams, players, and competitions.
            </p>
          </div>
          <Link href="/organizations/new" className="w-full">
            <Button size="lg" className="w-full">
              Register organization
            </Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
