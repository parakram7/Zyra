import { Bell } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/shared/empty-state";
import { NotificationItem } from "@/components/notifications/notification-item";
import { MarkAllReadButton } from "@/components/notifications/mark-all-read-button";
import { RealtimeRefresher } from "@/components/realtime/realtime-refresher";

export default async function NotificationsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const supabase = await createClient();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const hasUnread = (notifications ?? []).some((n) => !n.read);

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <RealtimeRefresher tables={["notifications"]} filter={`recipient_id=eq.${profile.id}`} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        {hasUnread && <MarkAllReadButton />}
      </div>

      {(notifications ?? []).length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" description="You'll see updates on rescues you're involved with here." />
      ) : (
        <div className="space-y-2">
          {notifications!.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </div>
      )}
    </div>
  );
}
