export function formatTime(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
  });
}

export function formatRelative(iso: string | null | undefined, now: Date = new Date()) {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  const diffMin = Math.round((now.getTime() - then) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

export function telHref(phone: string | null | undefined) {
  if (!phone) return undefined;
  return `tel:${phone.replace(/\s+/g, "")}`;
}

export function whatsappHref(phone: string | null | undefined, message: string) {
  if (!phone) return undefined;
  const digits = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function formatCurrencyRange(low: number | null | undefined, high: number | null | undefined) {
  if (low == null && high == null) return "Not estimated yet";
  if (low != null && high != null) return `₹${Math.round(low)}–₹${Math.round(high)}`;
  return `₹${Math.round((low ?? high)!)}`;
}

export function formatQuantity(quantity: number, unit: string) {
  return `${quantity} ${unit}`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

export function daysAgoIso(days: number) {
  return new Date(Date.now() - days * 86400000).toISOString();
}
