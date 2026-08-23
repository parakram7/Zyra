"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** Subscribes to Postgres changes on the given tables and refreshes the current
 * server-rendered page so lists/dashboards update without a manual reload. */
export function RealtimeRefresher({ tables, filter }: { tables: string[]; filter?: string }) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`rt-${tables.join("-")}-${filter ?? "all"}`);

    tables.forEach((table) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table, ...(filter ? { filter } : {}) },
        () => {
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => router.refresh(), 400);
        }
      );
    });

    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tables.join(","), filter]);

  return null;
}
