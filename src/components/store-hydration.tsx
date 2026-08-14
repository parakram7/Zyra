"use client";

import { useEffect } from "react";
import { useZyraStore } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function StoreHydration() {
  useEffect(() => {
    if (isSupabaseConfigured()) {
      let unsubscribe: (() => void) | null = null;
      useZyraStore
        .getState()
        .loadFromSupabase()
        .catch((err) => console.error("Zyra: failed to load from Supabase", err))
        .finally(() => {
          useZyraStore.getState().setHasHydrated(true);
          unsubscribe = useZyraStore.getState().subscribeRealtime();
        });
      return () => unsubscribe?.();
    }

    useZyraStore.persist.rehydrate();
    useZyraStore.getState().setHasHydrated(true);
  }, []);
  return null;
}
