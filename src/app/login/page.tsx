"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Zap } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/field";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { signInWithPassword, signUpWithPassword } from "@/lib/supabase/auth";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/profile";

  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signedUp, setSignedUp] = useState(false);

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-md px-4 pt-6 md:px-8 md:pt-10">
        <PageHeader title="Sign in" backHref="/profile" />
        <Card>
          <CardBody>
            <p className="text-sm text-ink-300">
              Accounts aren&apos;t set up yet — this Zyra instance is running in local demo mode
              (no shared backend connected). Every screen still works; there&apos;s just nothing to
              sign in to.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "sign-in") {
        await signInWithPassword(email, password);
        router.push(redirectTo);
      } else {
        await signUpWithPassword(email, password);
        setSignedUp(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-6 md:px-8 md:pt-10">
      <PageHeader title={mode === "sign-in" ? "Sign in" : "Create account"} backHref="/profile" />

      <div className="mb-6 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
          <Zap size={16} className="text-white" fill="currentColor" strokeWidth={0} />
        </div>
        <span className="font-display text-lg font-semibold text-ink-50">Zyra</span>
      </div>

      {signedUp ? (
        <Card>
          <CardBody className="flex flex-col gap-3">
            <p className="text-sm text-ink-100">
              Check <span className="font-semibold text-ink-50">{email}</span> for a confirmation
              link, then come back and sign in.
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setSignedUp(false);
                setMode("sign-in");
              }}
            >
              Back to sign in
            </Button>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="coach@school.edu"
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              {error && <p className="text-xs font-medium text-cardred">{error}</p>}
              <Button type="submit" size="lg" disabled={loading} className="w-full">
                {loading ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}
              </Button>
            </form>
          </CardBody>
        </Card>
      )}

      {!signedUp && (
        <p className="mt-4 text-center text-sm text-ink-400">
          {mode === "sign-in" ? (
            <>
              Need an account?{" "}
              <button className="font-semibold text-brand-400" onClick={() => setMode("sign-up")}>
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button className="font-semibold text-brand-400" onClick={() => setMode("sign-in")}>
                Sign in
              </button>
            </>
          )}
        </p>
      )}

      <p className="mt-8 text-center text-xs text-ink-500">
        <Link href="/" className="hover:text-ink-300">
          &larr; Back to Zyra
        </Link>
      </p>
    </div>
  );
}
