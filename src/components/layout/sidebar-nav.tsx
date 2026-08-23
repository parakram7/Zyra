"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ADMIN_NAV, VOLUNTEER_NAV } from "@/components/layout/nav-items";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/lib/database.types";

export function SidebarNav({ profile, unreadCount = 0 }: { profile: Profile; unreadCount?: number }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
      {VOLUNTEER_NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary/10 text-sidebar-primary"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <span className="flex items-center gap-2.5">
              <Icon className="size-4" />
              {item.label}
            </span>
            {item.label === "Notifications" && unreadCount > 0 && (
              <Badge variant="urgent" className="h-5 min-w-5 justify-center px-1">
                {unreadCount}
              </Badge>
            )}
          </Link>
        );
      })}

      {profile.role === "admin" && (
        <>
          <Separator className="my-2" />
          <p className="px-3 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Admin
          </p>
          {ADMIN_NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary/10 text-sidebar-primary"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </>
      )}
    </nav>
  );
}
