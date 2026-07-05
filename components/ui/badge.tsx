import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "emerald" | "cyan";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-white/[0.06] text-muted",
    emerald: "bg-emerald-dim text-emerald",
    cyan: "bg-cyan-dim text-cyan",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
