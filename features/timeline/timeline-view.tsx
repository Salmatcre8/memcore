"use client";

import { useEffect, useState } from "react";
import { TimelineGroup } from "@/types/memory";
import { MEMORY_TYPE_META } from "@/lib/memory-meta";
import { formatRelativeTime } from "@/lib/utils";

export function TimelineView() {
  const [groups, setGroups] = useState<TimelineGroup[] | null>(null);

  useEffect(() => {
    fetch("/api/timeline")
      .then((r) => r.json())
      .then((d) => setGroups(d.groups));
  }, []);

  if (!groups) {
    return <div className="py-16 text-center text-muted text-sm">Loading timeline…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      {groups.map((group) => (
        <div key={group.label} className="mb-10">
          <h2 className="mb-4 text-[11.5px] font-medium uppercase tracking-wider text-emerald">
            {group.label}
          </h2>
          <div className="relative border-l border-line pl-6">
            {group.items.map((item) => {
              const meta = MEMORY_TYPE_META[item.type];
              const Icon = meta.icon;
              return (
                <div key={item.id} className="relative mb-6 last:mb-0">
                  <span className="absolute -left-[29px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-card hairline text-emerald">
                    <Icon size={12} />
                  </span>
                  <p className="text-[11.5px] text-muted">
                    {formatRelativeTime(item.timestamp)} · {item.source}
                  </p>
                  <p className="font-display text-[15px] text-warmwhite">{item.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">
                    {item.summary}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
