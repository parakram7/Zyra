"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MoreHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DonorTrust } from "@/lib/database.types";

const OPTIONS: DonorTrust[] = ["trusted", "standard", "flagged"];

export function DonorTrustMenu({ donorId, current }: { donorId: string; current: DonorTrust }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setTrust(trust: DonorTrust) {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("donor_profiles").update({ trust_status: trust }).eq("id", donorId);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Marked ${trust}`);
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <MoreHorizontal />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {OPTIONS.filter((o) => o !== current).map((o) => (
          <DropdownMenuItem key={o} onClick={() => setTrust(o)} className="capitalize">
            Mark {o}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
