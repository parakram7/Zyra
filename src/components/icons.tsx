import { cn } from "@/lib/cn";

export function FootballIcon({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn(className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 7.2L15.4 9.7L14.1 13.7H9.9L8.6 9.7L12 7.2Z"
        fill="currentColor"
      />
      <path
        d="M12 3v4.2M12 20.8V16.8M4.5 8.5l3.6 1.2M19.5 8.5l-3.6 1.2M4.5 15.5l3.9-2M19.5 15.5l-3.9-2M9.9 13.7L7 17.5M14.1 13.7L17 17.5"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CardIcon({ type, size = 14 }: { type: "YELLOW_CARD" | "RED_CARD"; size?: number }) {
  return (
    <span
      className={cn(
        "inline-block rounded-[3px]",
        type === "YELLOW_CARD" ? "bg-cardyellow" : "bg-cardred"
      )}
      style={{ width: size * 0.72, height: size }}
    />
  );
}
