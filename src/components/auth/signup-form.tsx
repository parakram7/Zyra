"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { signupSchema, type SignupInput } from "@/lib/schemas/auth";
import { TRANSPORT_TYPE_LABELS } from "@/lib/labels";
import type { Zone } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

const TRANSPORT_TYPES = Object.keys(TRANSPORT_TYPE_LABELS) as (keyof typeof TRANSPORT_TYPE_LABELS)[];

export function SignupForm({ chapterId, zones }: { chapterId: string; zones: Zone[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      chapterId,
      preferredZoneIds: [],
      hasTransport: false,
      transportType: "no_vehicle",
    },
  });

  const hasTransport = watch("hasTransport");

  async function onSubmit(values: SignupInput) {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
          phone: values.phone,
          role: "volunteer",
          chapter_id: values.chapterId,
          preferred_zone_ids: values.preferredZoneIds,
          has_transport: values.hasTransport,
          transport_type: values.transportType,
        },
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/pending-verification");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" {...register("fullName")} />
          {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone number</Label>
          <Input id="phone" type="tel" placeholder="+91 90000 00000" {...register("phone")} />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Preferred zone(s)</Label>
        <p className="text-xs text-muted-foreground">Pick the areas you can respond to fastest.</p>
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
                        onCheckedChange={(v) => {
                          field.onChange(
                            v ? [...field.value, zone.id] : field.value.filter((id) => id !== zone.id)
                          );
                        }}
                      />
                      {zone.name}
                    </label>
                  );
                })}
              </>
            )}
          />
        </div>
        {errors.preferredZoneIds && (
          <p className="text-sm text-destructive">{errors.preferredZoneIds.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between rounded-md border p-3">
        <div>
          <Label htmlFor="hasTransport">I have my own transport</Label>
          <p className="text-xs text-muted-foreground">Helps us match you to rescues that need a vehicle.</p>
        </div>
        <Controller
          control={control}
          name="hasTransport"
          render={({ field }) => (
            <Switch id="hasTransport" checked={field.value} onCheckedChange={field.onChange} />
          )}
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
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSPORT_TYPES.filter((t) => t !== "no_vehicle").map((t) => (
                    <SelectItem key={t} value={t}>
                      {TRANSPORT_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading && <Loader2 className="animate-spin" />}
        Create account
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
