"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/field";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuthUser } from "@/lib/supabase/auth";
import { useZyraStore } from "@/lib/store";

export default function NewOrganizationPage() {
  const user = useAuthUser();

  if (isSupabaseConfigured() && user === undefined) return null;

  if (isSupabaseConfigured() && !user) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16">
        <Card>
          <CardBody className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/15">
              <LogIn size={20} className="text-brand-400" />
            </div>
            <div>
              <p className="font-display text-base font-semibold text-ink-50">Sign in first</p>
              <p className="mt-1.5 text-sm text-ink-400">
                Create an account, then come back here to register your school or club.
              </p>
            </div>
            <Link href="/login?redirect=/organizations/new" className="w-full">
              <Button size="lg" className="w-full">
                Sign in
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  return <NewOrganizationForm />;
}

function NewOrganizationForm() {
  const router = useRouter();
  const createOrganization = useZyraStore((s) => s.createOrganization);

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    try {
      await createOrganization({ name: name.trim(), city: city.trim() });
      router.push("/teams/new");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-6 md:px-8 md:pt-10">
      <PageHeader title="Register Your Organization" subtitle="Your school or club's home on Zyra" backHref="/profile" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Card>
          <CardBody className="flex flex-col gap-4">
            <div>
              <Label>School / club name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Riverside School" />
            </div>
            <div>
              <Label>City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Pune" />
            </div>
          </CardBody>
        </Card>

        {error && <p className="text-xs font-medium text-cardred">{error}</p>}

        <Button type="submit" size="lg" disabled={!canSubmit || loading} className="w-full">
          {loading ? "Creating…" : "Create Organization"}
        </Button>

        <p className="text-center text-xs text-ink-500">
          You&apos;ll be its first admin — add your teams and players next.
        </p>
      </form>
    </div>
  );
}
