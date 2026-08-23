"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MOBILE_NAV } from "@/components/layout/nav-items";

export function BottomNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden">
      <ul className="grid grid-cols-5">
        {MOBILE_NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-5" />
                {item.label}
                {item.label === "Alerts" && unreadCount > 0 && (
                  <span className="absolute right-[calc(50%-18px)] top-1 flex size-4 items-center justify-center rounded-full bg-urgent text-[9px] text-urgent-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
