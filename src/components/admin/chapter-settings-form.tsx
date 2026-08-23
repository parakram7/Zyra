"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Chapter } from "@/lib/database.types";

interface FormValues {
  name: string;
  code: string;
  contactPhone: string;
  mealsPerKg: number;
  pickupWarningMinutes: number;
  transportBaseCharge: number;
  transportPerKm: number;
  multSmall: number;
  multMedium: number;
  multLarge: number;
  multVeryLarge: number;
  disclaimer: string;
}

export function ChapterSettingsForm({ chapter }: { chapter: Chapter }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const mult = (chapter.transport_size_multiplier ?? {}) as Record<string, number>;

  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      name: chapter.name,
      code: chapter.code,
      contactPhone: chapter.contact_phone ?? "",
      mealsPerKg: chapter.meals_per_kg,
      pickupWarningMinutes: chapter.pickup_warning_minutes,
      transportBaseCharge: chapter.transport_base_charge,
      transportPerKm: chapter.transport_per_km,
      multSmall: mult.small ?? 1,
      multMedium: mult.medium ?? 1.4,
      multLarge: mult.large ?? 2,
      multVeryLarge: mult.very_large ?? 3,
      disclaimer: chapter.food_assessment_disclaimer,
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("chapters")
      .update({
        name: values.name,
        code: values.code,
        contact_phone: values.contactPhone || null,
        meals_per_kg: values.mealsPerKg,
        pickup_warning_minutes: values.pickupWarningMinutes,
        transport_base_charge: values.transportBaseCharge,
        transport_per_km: values.transportPerKm,
        transport_size_multiplier: {
          small: values.multSmall,
          medium: values.multMedium,
          large: values.multLarge,
          very_large: values.multVeryLarge,
        },
        food_assessment_disclaimer: values.disclaimer,
      })
      .eq("id", chapter.id);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Settings saved");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chapter</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Chapter name</Label>
            <Input {...register("name")} />
          </div>
          <div className="space-y-1.5">
            <Label>Chapter code</Label>
            <Input {...register("code")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Contact phone</Label>
            <Input {...register("contactPhone")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Meals & urgency assumptions</CardTitle>
          <CardDescription>Used to auto-estimate meals and to flag pickups as urgent.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Meals per kg</Label>
            <Input type="number" step="0.1" {...register("mealsPerKg")} />
          </div>
          <div className="space-y-1.5">
            <Label>Pickup warning window (minutes)</Label>
            <Input type="number" {...register("pickupWarningMinutes")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transport cost assumptions</CardTitle>
          <CardDescription>Indicative estimates only — never presented as guaranteed pricing.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Base charge (₹)</Label>
            <Input type="number" {...register("transportBaseCharge")} />
          </div>
          <div className="space-y-1.5">
            <Label>Per km (₹)</Label>
            <Input type="number" {...register("transportPerKm")} />
          </div>
          <div className="space-y-1.5">
            <Label>Small load multiplier</Label>
            <Input type="number" step="0.1" {...register("multSmall")} />
          </div>
          <div className="space-y-1.5">
            <Label>Medium load multiplier</Label>
            <Input type="number" step="0.1" {...register("multMedium")} />
          </div>
          <div className="space-y-1.5">
            <Label>Large load multiplier</Label>
            <Input type="number" step="0.1" {...register("multLarge")} />
          </div>
          <div className="space-y-1.5">
            <Label>Very large load multiplier</Label>
            <Input type="number" step="0.1" {...register("multVeryLarge")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Field assessment disclaimer</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea rows={3} {...register("disclaimer")} />
        </CardContent>
      </Card>

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="animate-spin" />}
        Save settings
      </Button>
    </form>
  );
}
