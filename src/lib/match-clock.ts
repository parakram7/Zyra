import type { Match } from "./types";

export function getLiveMinute(match: Match): number {
  if (!match.clockRunning || !match.clockStartedAt) return match.clockBaseMinute;
  const elapsedMs = Date.now() - match.clockStartedAt;
  const elapsedMin = Math.floor(elapsedMs / 60000);
  const cap = match.currentHalf === 2 ? match.durationMinutes : match.halfLengthMinutes;
  return Math.min(match.clockBaseMinute + elapsedMin, cap);
}

export function formatMinute(minute: number, half: Match["currentHalf"]): string {
  if (half === "HT") return "HT";
  if (half === "FT") return "FT";
  return `${minute}'`;
}

export function formatKickoffCountdown(dateIso: string): string {
  const diffMs = new Date(dateIso).getTime() - Date.now();
  if (diffMs <= 0) return "Kick-off due";
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `Kicks off in ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Kicks off in ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Kicks off in ${days}d`;
}
