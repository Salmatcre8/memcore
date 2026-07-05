"use client";

import { useEffect, useState } from "react";
import { Decision } from "@/types/memory";
import { DecisionCard } from "./decision-card";

export function DecisionsView() {
  const [decisions, setDecisions] = useState<Decision[] | null>(null);

  useEffect(() => {
    fetch("/api/decisions")
      .then((r) => r.json())
      .then((d) => setDecisions(d.decisions));
  }, []);

  if (!decisions) {
    return <div className="py-16 text-center text-muted text-sm">Loading decisions…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {decisions.map((d) => (
        <DecisionCard key={d.id} decision={d} />
      ))}
    </div>
  );
}
