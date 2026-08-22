"use client";

import Link from "next/link";
import {
  Compass,
  HelpCircle,
  IdCard,
  LifeBuoy,
  School,
  Shield,
  Star,
  Trophy,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { AccountCard } from "@/components/account-card";
import { useMyOrgId, useOrganization } from "@/lib/hooks";
import { DEMO_PLAYER_ID } from "@/lib/seed-data";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const TILES = [
  { href: `/players/${DEMO_PLAYER_ID}`, label: "My Passport", icon: IdCard },
  { href: "/leaderboards", label: "Leaderboards", icon: Trophy },
  { href: "/teams", label: "Following", icon: Star },
  { href: "/discover", label: "Discover", icon: Compass },
];

export default function ProfilePage() {
  const org = useOrganization(useMyOrgId());

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 md:px-8 md:pt-10">
      <PageHeader title="More" subtitle="Your Zyra profile" />

      <AccountCard />

      {isSupabaseConfigured() && org && (
        <Link
          href={`/discover/${org.id}`}
          className="mb-6 flex items-center gap-4 rounded-2xl border border-ink-700/40 bg-ink-850 p-4 transition-colors hover:border-ink-500/60"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-400/15">
            <School size={20} className="text-sky-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">Your organization</p>
            <p className="truncate font-display text-sm font-semibold text-ink-50">{org.name}</p>
          </div>
          <Shield size={16} className="shrink-0 text-ink-500" />
        </Link>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3">
        {TILES.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-start gap-3 rounded-2xl border border-ink-700/40 bg-ink-850 p-4 transition-colors hover:border-ink-500/60"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15">
              <Icon size={18} className="text-brand-400" />
            </div>
            <span className="text-sm font-semibold text-ink-50">{label}</span>
          </Link>
        ))}
      </div>

      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-500">Support</p>
      <div className="mb-10 flex flex-col overflow-hidden rounded-2xl border border-ink-700/40 bg-ink-850">
        <a
          href="mailto:support@zyra.app"
          className="flex items-center gap-3 border-b border-ink-800 px-4 py-3.5 text-sm text-ink-200 hover:bg-ink-800/50"
        >
          <HelpCircle size={16} className="text-ink-500" /> Help / FAQs
        </a>
        <a
          href="mailto:support@zyra.app"
          className="flex items-center gap-3 px-4 py-3.5 text-sm text-ink-200 hover:bg-ink-800/50"
        >
          <LifeBuoy size={16} className="text-ink-500" /> Contact support
        </a>
      </div>
    </div>
  );
}
