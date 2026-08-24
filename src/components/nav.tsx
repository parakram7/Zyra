"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarRange, Shield, Trophy, CircleUserRound, Zap, LogIn, LogOut } from "lucide-react";
import { cn } from "@/lib/cn";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { signOut, useAuthUser } from "@/lib/supabase/auth";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/matches", label: "Matches", icon: CalendarRange },
  { href: "/teams", label: "Teams", icon: Shield },
  { href: "/competitions", label: "Competitions", icon: Trophy },
  { href: "/profile", label: "Profile", icon: CircleUserRound },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function BottomNav() {
  const pathname = usePathname();
  if (pathname.includes("/live")) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-700/50 bg-ink-950/95 backdrop-blur-xl safe-bottom md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className="tap-target relative flex flex-1 flex-col items-center gap-1 py-2.5 pt-3"
            >
              <span
                className={cn(
                  "absolute top-0 h-0.5 w-6 rounded-full bg-brand-400 transition-opacity",
                  active ? "opacity-100" : "opacity-0"
                )}
              />
              <Icon
                size={21}
                strokeWidth={active ? 2.2 : 1.7}
                className={cn("transition-colors", active ? "text-brand-400" : "text-ink-400")}
              />
              <span
                className={cn(
                  "text-[10.5px] font-medium tracking-tight transition-colors",
                  active ? "text-ink-50" : "text-ink-400"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-ink-700/50 bg-ink-950 md:flex">
      <div className="flex items-center gap-2.5 px-6 py-7">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
          <Zap size={16} className="text-white" fill="currentColor" strokeWidth={0} />
        </div>
        <span className="font-display text-lg font-semibold tracking-tight text-ink-50">Zyra</span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-500/10 text-ink-50"
                  : "text-ink-300 hover:bg-ink-800/60 hover:text-ink-50"
              )}
            >
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-brand-400 transition-opacity",
                  active ? "opacity-100" : "opacity-0"
                )}
              />
              <Icon size={18} strokeWidth={active ? 2.1 : 1.7} className={active ? "text-brand-400" : ""} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-3 px-3 pb-6">
        <Link
          href="/matches/new"
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-500 active:scale-[0.98]"
        >
          Start Match
        </Link>
        <AuthStatus />
      </div>
    </aside>
  );
}

function AuthStatus() {
  const user = useAuthUser();
  if (!isSupabaseConfigured()) return null;

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-ink-300 transition-colors hover:bg-ink-800/60 hover:text-ink-50"
      >
        <LogIn size={16} /> Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg px-3.5 py-2 text-xs text-ink-400">
      <span className="min-w-0 truncate" title={user.email}>
        {user.email}
      </span>
      <button
        onClick={() => signOut()}
        className="tap-target flex shrink-0 items-center gap-1 font-medium text-ink-300 hover:text-ink-50"
      >
        <LogOut size={13} /> Out
      </button>
    </div>
  );
}
