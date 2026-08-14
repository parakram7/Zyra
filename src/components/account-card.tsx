"use client";

import Link from "next/link";
import { LogIn, LogOut, ShieldCheck } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { signOut, useAuthUser } from "@/lib/supabase/auth";

export function AccountCard() {
  const user = useAuthUser();
  if (!isSupabaseConfigured()) return null;

  return (
    <Card className="mb-6">
      <CardBody className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-500/15">
          <ShieldCheck size={20} className="text-brand-400" />
        </div>
        {user ? (
          <>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">Signed in as</p>
              <p className="truncate font-display text-sm font-semibold text-ink-50">{user.email}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => signOut()}>
              <LogOut size={14} /> Sign out
            </Button>
          </>
        ) : (
          <>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-semibold text-ink-50">Not signed in</p>
              <p className="mt-0.5 text-xs text-ink-400">Coaches and scorers sign in to record matches.</p>
            </div>
            <Link href="/login">
              <Button size="sm">
                <LogIn size={14} /> Sign in
              </Button>
            </Link>
          </>
        )}
      </CardBody>
    </Card>
  );
}
