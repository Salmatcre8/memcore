"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, GitCommitVertical } from "lucide-react";
import { Decision } from "@/types/memory";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";

const STATUS_LABEL: Record<Decision["status"], string> = {
  active: "Active",
  superseded: "Superseded",
  revisited: "Under revisit",
};

export function DecisionCard({ decision }: { decision: Decision }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl bg-card/70 hairline shadow-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-dim text-emerald">
            <GitCommitVertical size={16} />
          </span>
          <div>
            <p className="font-display text-[16px] text-warmwhite">{decision.title}</p>
            <p className="text-[12px] text-muted">
              {formatRelativeTime(decision.timestamp)} · {decision.peopleInvolved.join(", ")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone={decision.status === "active" ? "emerald" : "cyan"}>
            {STATUS_LABEL[decision.status]}
          </Badge>
          <ChevronDown
            size={16}
            className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-line/70 px-6 py-5"
        >
          <p className="text-[11.5px] uppercase tracking-wide text-emerald">Why</p>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-warmwhite/90">
            {decision.reasoning}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-4 text-[12.5px]">
            <div>
              <p className="text-muted">Related meetings</p>
              <p className="mt-1 text-warmwhite">{decision.relatedMeetingIds.length}</p>
            </div>
            <div>
              <p className="text-muted">Related documents</p>
              <p className="mt-1 text-warmwhite">{decision.relatedDocumentIds.length}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
