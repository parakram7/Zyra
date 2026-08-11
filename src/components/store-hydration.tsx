"use client";

import { useEffect } from "react";
import { useZyraStore } from "@/lib/store";

export function StoreHydration() {
  useEffect(() => {
    useZyraStore.persist.rehydrate();
    useZyraStore.getState().setHasHydrated(true);
  }, []);
  return null;
}
