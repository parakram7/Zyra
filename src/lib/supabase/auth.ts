"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "./client";

export async function signInWithPassword(email: string, password: string) {
  const { error } = await getSupabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUpWithPassword(email: string, password: string) {
  const { error } = await getSupabase().auth.signUp({ email, password });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await getSupabase().auth.signOut();
  if (error) throw error;
}

// null = signed out or Supabase not configured, undefined = still loading.
export function useAuthUser(): User | null | undefined {
  const [user, setUser] = useState<User | null | undefined>(
    isSupabaseConfigured() ? undefined : null
  );

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const sb = getSupabase();
    sb.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return user;
}
