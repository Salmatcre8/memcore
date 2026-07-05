"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { MemorySearchResult, ExplainResponse } from "@/types/memory";
import { MemoryCard } from "./memory-card";

const PROMPTS = [
  "Why did we migrate to PostgreSQL?",
  "Show every discussion about authentication.",
  "What decisions were made last week?",
  "Explain why we chose Redis.",
];

export function SearchExperience({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<MemorySearchResult[]>([]);
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function runSearch(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setExplanation(null);
    try {
      const [searchRes, explainRes] = await Promise.all([
        fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q }),
        }),
        fetch("/api/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q }),
        }),
      ]);
      const searchData = await searchRes.json();
      const explainData = await explainRes.json();
      setResults(searchData.results ?? []);
      if (!explainData.error) setExplanation(explainData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialQuery) runSearch(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10 text-center">
        <h1 className="font-display text-[32px] text-warmwhite">
          Ask your team&apos;s memory
        </h1>
        <p className="mt-2 text-[14px] text-muted">
          Search across meetings, decisions, pull requests, and docs — connected, not just indexed.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(query);
        }}
        className="relative"
      >
        <Search size={18} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Why did we migrate to PostgreSQL?"
          className="glass h-14 w-full rounded-2xl pl-13 pr-32 text-[15px] text-warmwhite placeholder:text-muted focus-ring"
          style={{ paddingLeft: "3.25rem" }}
          autoFocus
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-emerald px-4 py-2 text-[13px] font-medium text-ink hover:bg-emerald/90 transition-colors"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : "Ask"}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => {
              setQuery(p);
              runSearch(p);
            }}
            className="rounded-full hairline bg-white/[0.03] px-3.5 py-1.5 text-[12px] text-muted transition-colors hover:text-warmwhite hover:border-white/20"
          >
            {p}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {explanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-8 overflow-hidden rounded-2xl bg-emerald-dim/40 hairline p-6"
          >
            <div className="mb-2 flex items-center gap-2 text-emerald">
              <Sparkles size={15} />
              <span className="text-[12px] font-medium uppercase tracking-wide">
                Explain this
              </span>
            </div>
            <p className="text-[14.5px] leading-relaxed text-warmwhite">
              {explanation.answer}
            </p>
            <div className="mt-4 space-y-1.5">
              {explanation.reasoningSteps.map((step, i) => (
                <div key={i} className="flex gap-2 text-[12.5px] text-muted">
                  <span className="text-emerald">{i + 1}.</span>
                  {step}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-10 space-y-3">
        {loading && results.length === 0 && (
          <div className="flex justify-center py-10 text-muted">
            <Loader2 size={18} className="animate-spin" />
          </div>
        )}
        {results.map((r, i) => (
          <MemoryCard key={r.id} memory={r} index={i} />
        ))}
        {!loading && results.length === 0 && query === "" && (
          <p className="pt-4 text-center text-[13px] text-muted">
            Try one of the prompts above, or ask anything about your team&apos;s history.
          </p>
        )}
      </div>
    </div>
  );
}
