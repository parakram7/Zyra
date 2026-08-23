"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock } from "lucide-react";
import { getUrgency } from "@/lib/urgency";
import { cn } from "@/lib/utils";

export function UrgencyBadge({ deadline, className }: { deadline: string; className?: string }) {
  const [urgency, setUrgency] = useState(() => getUrgency(deadline));

  useEffect(() => {
    const id = setInterval(() => setUrgency(getUrgency(deadline)), 30_000);
    return () => clearInterval(id);
  }, [deadline]);

  const isHot = urgency.level === "critical" || urgency.level === "expired";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
        urgency.level === "expired" && "bg-urgent text-urgent-foreground",
        urgency.level === "critical" && "bg-urgent text-urgent-foreground",
        urgency.level === "urgent" && "bg-warning text-warning-foreground",
        urgency.level === "soon" && "bg-accent text-accent-foreground",
        urgency.level === "normal" && "bg-secondary text-secondary-foreground",
        className
      )}
    >
      {isHot ? <AlertTriangle className="size-3.5" /> : <Clock className="size-3.5" />}
      {urgency.label}
    </span>
  );
}
