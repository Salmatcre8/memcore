"use client";

import { motion } from "framer-motion";
import { MemorySearchResult } from "@/types/memory";
import { MEMORY_TYPE_META } from "@/lib/memory-meta";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";

export function MemoryCard({
  memory,
  index = 0,
}: {
  memory: MemorySearchResult;
  index?: number;
}) {
  const meta = MEMORY_TYPE_META[memory.type];
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
      className="group rounded-2xl bg-card/70 hairline p-5 shadow-card transition-colors hover:border-white/15"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-emerald">
            <Icon size={15} />
          </span>
          <div>
            <p className="font-display text-[15.5px] leading-snug text-warmwhite">
              {memory.title}
            </p>
            <p className="text-[11.5px] text-muted">
              {memory.source} · {formatRelativeTime(memory.timestamp)}
            </p>
          </div>
        </div>
        <Badge tone={meta.tone === "neutral" ? "neutral" : meta.tone}>
          {meta.label}
        </Badge>
      </div>

      <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
        {memory.excerpt}
      </p>

      {memory.participants && memory.participants.length > 0 && (
        <div className="mt-4 flex items-center gap-1.5">
          {memory.participants.slice(0, 4).map((p) => (
            <span
              key={p}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.06] text-[10px] text-warmwhite"
              title={p}
            >
              {p.slice(0, 2).toUpperCase()}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
