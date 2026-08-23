"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function VerifyRejectButtons({ rescueId }: { rescueId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"verify" | "reject" | null>(null);

  async function act(kind: "verify" | "reject") {
    setLoading(kind);
    const supabase = createClient();
    const { error } = await supabase.rpc("admin_set_rescue_verification", {
      p_rescue_id: rescueId,
      p_verified: kind === "verify",
      p_status: kind === "verify" ? "open" : "rejected",
    });
    setLoading(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(kind === "verify" ? "Verified and published" : "Rejected");
    router.refresh();
  }

  return (
    <div className="flex gap-1.5">
      <Button size="sm" variant="outline" onClick={() => act("verify")} disabled={loading !== null}>
        {loading === "verify" ? <Loader2 className="animate-spin" /> : <Check />}
        Verify
      </Button>
      <Button size="sm" variant="outline" className="text-destructive" onClick={() => act("reject")} disabled={loading !== null}>
        {loading === "reject" ? <Loader2 className="animate-spin" /> : <X />}
        Reject
      </Button>
    </div>
  );
}
