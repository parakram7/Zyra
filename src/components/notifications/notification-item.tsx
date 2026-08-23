"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell, UserPlus, Truck, Clock, XCircle, MessageSquare, ArrowUpRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/database.types";

const ICONS: Record<Notification["type"], typeof Bell> = {
  new_urgent_rescue: Bell,
  rescue_updated: ArrowUpRight,
  transport_needed: Truck,
  volunteer_joined: UserPlus,
  deadline_approaching: Clock,
  rescue_cancelled: XCircle,
  admin_message: MessageSquare,
};

export function NotificationItem({ notification }: { notification: Notification }) {
  const router = useRouter();
  const Icon = ICONS[notification.type];

  async function handleClick() {
    if (!notification.read) {
      const supabase = createClient();
      await supabase.rpc("mark_notifications_read", { p_ids: [notification.id] });
      router.refresh();
    }
  }

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 transition-colors",
        notification.read ? "bg-background" : "border-primary/30 bg-primary/5"
      )}
    >
      <div className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full", notification.read ? "bg-muted" : "bg-primary/15")}>
        <Icon className={cn("size-4", notification.read ? "text-muted-foreground" : "text-primary")} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{notification.title}</p>
        <p className="text-sm text-muted-foreground">{notification.message}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{formatRelative(notification.created_at)}</p>
      </div>
      {!notification.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
    </div>
  );

  if (notification.rescue_id) {
    return (
      <Link href={`/rescues/${notification.rescue_id}`} onClick={handleClick}>
        {content}
      </Link>
    );
  }
  return <div onClick={handleClick}>{content}</div>;
}
