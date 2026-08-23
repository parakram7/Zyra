"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { TRANSPORT_TYPE_LABELS } from "@/lib/labels";
import type { Profile, Zone } from "@/lib/database.types";

interface FormValues {
  fullName: string;
  phone: string;
  preferredZoneIds: string[];
  hasTransport: boolean;
  transportType: string;
}

export function EditProfileForm({ profile, zones }: { profile: Profile; zones: Zone[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, control, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: {
      fullName: profile.full_name,
      phone: profile.phone,
      preferredZoneIds: profile.preferred_zone_ids,
      hasTransport: profile.has_transport,
      transportType: profile.transport_type,
    },
  });
  const hasTransport = watch("hasTransport");

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: values.fullName,
        phone: values.phone,
        preferred_zone_ids: values.preferredZoneIds,
        has_transport: values.hasTransport,
        transport_type: values.hasTransport ? (values.transportType as never) : "no_vehicle",
      })
      .eq("id", profile.id);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile updated");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Full name</Label>
        <Input {...register("fullName")} />
      </div>
      <div className="space-y-1.5">
        <Label>Phone</Label>
        <Input {...register("phone")} />
      </div>
      <div className="space-y-1.5">
        <Label>Preferred zones</Label>
        <div className="grid grid-cols-2 gap-2 rounded-md border p-3 sm:grid-cols-3">
          <Controller
            control={control}
            name="preferredZoneIds"
            render={({ field }) => (
              <>
                {zones.map((zone) => {
                  const checked = field.value.includes(zone.id);
                  return (
                    <label key={zone.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) =>
                          field.onChange(v ? [...field.value, zone.id] : field.value.filter((id) => id !== zone.id))
                        }
                      />
                      {zone.name}
                    </label>
                  );
                })}
              </>
            )}
          />
        </div>
      </div>
      <div className="flex items-center justify-between rounded-md border p-3">
        <Label htmlFor="hasTransport">I have my own transport</Label>
        <Controller
          control={control}
          name="hasTransport"
          render={({ field }) => <Switch id="hasTransport" checked={field.value} onCheckedChange={field.onChange} />}
        />
      </div>
      {hasTransport && (
        <div className="space-y-1.5">
          <Label>Transport type</Label>
          <Controller
            control={control}
            name="transportType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TRANSPORT_TYPE_LABELS).filter(([v]) => v !== "no_vehicle").map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="animate-spin" />}
        Save changes
      </Button>
    </form>
  );
}
