"use client";

import { useEffect } from "react";
import { useZyraStore } from "@/lib/store";
import { isSupabaseConfigured, getSupabase } from "@/lib/supabase/client";

export function StoreHydration() {
  useEffect(() => {
    if (isSupabaseConfigured()) {
      let unsubscribe: (() => void) | null = null;
      const sb = getSupabase();

      sb.auth
        .getSession()
        .then(({ data }) => {
          const userId = data.session?.user.id ?? null;
          return Promise.all([
            useZyraStore.getState().loadFromSupabase(userId),
            useZyraStore.getState().resolveMyOrg(userId),
          ]);
        })
        .catch((err) => console.error("Zyra: failed to load from Supabase", err))
        .finally(() => {
          useZyraStore.getState().setHasHydrated(true);
          unsubscribe = useZyraStore.getState().subscribeRealtime();
        });

      // Re-resolve which org the user belongs to whenever they sign in/out,
      // so creating or joining an org doesn't require a full page reload.
      const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
        useZyraStore.getState().resolveMyOrg(session?.user.id ?? null);
      });

      return () => {
        unsubscribe?.();
        sub.subscription.unsubscribe();
      };
    }

    useZyraStore.persist.rehydrate();
    useZyraStore.getState().setHasHydrated(true);
  }, []);
  return null;
}
