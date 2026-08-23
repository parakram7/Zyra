"use server";

import { createClient } from "@/lib/supabase/server";

export async function cancelByToken(token: string, reason: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_rescue_by_token", { p_token: token, p_reason: reason });
  return { ok: !error, error: error?.message };
}
