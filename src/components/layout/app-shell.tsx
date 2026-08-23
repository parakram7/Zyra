"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import type { Profile } from "@/lib/database.types";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LogoutButton } from "@/components/auth/logout-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AppShell({
  profile,
  unreadCount,
  children,
}: {
  profile: Profile;
  unreadCount: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex items-center gap-2 border-b px-4 py-4">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-sidebar-primary">
            RescueLink
          </Link>
        </div>
        <SidebarNav profile={profile} unreadCount={unreadCount} />
        <div className="flex items-center gap-3 border-t p-3">
          <Avatar>
            <AvatarFallback>{initials(profile.full_name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{profile.full_name}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">{profile.role}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur md:hidden">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
            RescueLink
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/notifications" aria-label="Notifications">
                <Bell />
                {unreadCount > 0 && (
                  <Badge
                    variant="urgent"
                    className="absolute right-0.5 top-0.5 h-4 min-w-4 justify-center px-1 text-[9px]"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Link>
            </Button>
          </div>
        </header>

        {/* Desktop top bar */}
        <header className="hidden items-center justify-end gap-2 border-b px-6 py-3 md:flex">
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>

        <BottomNav unreadCount={unreadCount} />
      </div>
    </div>
  );
}
