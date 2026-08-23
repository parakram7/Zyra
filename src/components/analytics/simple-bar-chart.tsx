"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function SimpleBarChart({
  data,
  color = "var(--color-chart-1)",
  layout = "horizontal",
}: {
  data: { label: string; value: number }[];
  color?: string;
  layout?: "horizontal" | "vertical";
}) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Not enough data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * (layout === "vertical" ? 34 : 0) + 40)}>
      <BarChart data={data} layout={layout} margin={{ left: layout === "vertical" ? 24 : 0, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        {layout === "vertical" ? (
          <>
            <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={12} />
            <YAxis type="category" dataKey="label" stroke="var(--color-muted-foreground)" fontSize={12} width={140} />
          </>
        ) : (
          <>
            <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--color-muted-foreground)" fontSize={12} allowDecimals={false} />
          </>
        )}
        <Tooltip
          contentStyle={{
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--color-popover-foreground)",
          }}
        />
        <Bar dataKey="value" fill={color} radius={4} />
      </BarChart>
    </ResponsiveContainer>
  );
}
