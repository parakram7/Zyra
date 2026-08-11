"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarRange, Shield, Trophy, CircleUserRound, Zap } from "lucide-react";
import { cn } from "@/lib/cn";

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
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-700/60 bg-ink-950/90 backdrop-blur-xl safe-bottom md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className="tap-target flex flex-1 flex-col items-center gap-1 py-2.5 pt-3"
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.4 : 1.8}
                className={cn("transition-colors", active ? "text-volt-300" : "text-ink-400")}
              />
              <span
                className={cn(
                  "text-[10.5px] font-medium tracking-tight transition-colors",
                  active ? "text-volt-300" : "text-ink-400"
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
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-ink-700/60 bg-ink-950/70 backdrop-blur-xl md:flex">
      <div className="flex items-center gap-2.5 px-6 py-7">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-volt-300 to-volt-600 shadow-glow">
          <Zap size={18} className="text-ink-950" fill="currentColor" strokeWidth={0} />
        </div>
        <span className="font-display text-xl font-bold tracking-tight text-white">Zyra</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-volt-300/10 text-volt-300"
                  : "text-ink-300 hover:bg-ink-800/60 hover:text-ink-50"
              )}
            >
              <Icon size={19} strokeWidth={active ? 2.3 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-6">
        <Link
          href="/matches/new"
          className="flex items-center justify-center gap-2 rounded-xl bg-volt-300 px-4 py-3 text-sm font-bold text-ink-950 shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Start Match
        </Link>
      </div>
    </aside>
  );
}
