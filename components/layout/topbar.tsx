"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";

export function Topbar() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    router.push(`/workspace/search?q=${encodeURIComponent(value)}`);
  }

  return (
    <header className="flex h-16 items-center gap-4 border-b border-line/70 bg-ink/70 px-6 backdrop-blur">
      <form onSubmit={handleSubmit} className="relative w-full max-w-md">
        <Search
          size={15}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask your team's memory..."
          className="h-9 w-full rounded-full bg-surface hairline pl-9 pr-4 text-[13px] text-warmwhite placeholder:text-muted focus-ring"
        />
      </form>
      <div className="ml-auto flex items-center gap-2 text-[12px] text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse-soft" />
        Memory syncing live
      </div>
    </header>
  );
}
