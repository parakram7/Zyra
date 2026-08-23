import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { VERIFICATION_STATUS_LABELS, TRANSPORT_TYPE_LABELS } from "@/lib/labels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const supabase = await createClient();
  const { data: zones } = await supabase
    .from("zones")
    .select("*")
    .eq("chapter_id", profile.chapter_id!)
    .eq("active", true)
    .order("sort_order");

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-6">
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Verification</span>
            <Badge variant={profile.verification_status === "verified" ? "success" : "warning"}>
              {VERIFICATION_STATUS_LABELS[profile.verification_status]}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Role</span>
            <span className="font-medium capitalize">{profile.role}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current transport</span>
            <span className="font-medium">{TRANSPORT_TYPE_LABELS[profile.transport_type]}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Edit details</CardTitle>
        </CardHeader>
        <CardContent>
          <EditProfileForm profile={profile} zones={zones ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
