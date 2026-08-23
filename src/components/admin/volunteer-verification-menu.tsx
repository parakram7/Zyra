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
import type { VerificationStatus } from "@/lib/database.types";

const OPTIONS: { value: VerificationStatus; label: string }[] = [
  { value: "verified", label: "Verify" },
  { value: "rejected", label: "Reject" },
  { value: "suspended", label: "Suspend" },
  { value: "pending", label: "Set pending" },
];

export function VolunteerVerificationMenu({ profileId, current }: { profileId: string; current: VerificationStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatus(status: VerificationStatus) {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("admin_set_volunteer_verification", {
      p_profile_id: profileId,
      p_status: status,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Volunteer ${status}`);
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
        {OPTIONS.filter((o) => o.value !== current).map((o) => (
          <DropdownMenuItem key={o.value} onClick={() => setStatus(o.value)}>
            {o.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
