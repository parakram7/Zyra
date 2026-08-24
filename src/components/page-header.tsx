"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function PageHeader({
  title,
  subtitle,
  backHref,
  action,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="sticky top-0 z-30 -mx-4 mb-6 border-b border-ink-800/50 bg-ink-950/90 px-4 py-4 backdrop-blur-xl md:static md:mx-0 md:border-none md:bg-transparent md:px-0 md:py-0 md:pb-0 md:backdrop-blur-none">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              className="tap-target flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-800/80 text-ink-300 hover:text-ink-50"
            >
              <ChevronLeft size={18} />
            </Link>
          )}
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-ink-50 md:text-2xl">
              {title}
            </h1>
            {subtitle && <p className="mt-0.5 text-sm text-ink-400">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
    </div>
  );
}
