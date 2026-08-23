"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function MarkAllReadButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const supabase = createClient();
    await supabase.rpc("mark_all_notifications_read");
    setLoading(false);
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={loading}>
      {loading ? <Loader2 className="animate-spin" /> : <CheckCheck />}
      Mark all read
    </Button>
  );
}
