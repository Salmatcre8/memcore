"use client";

import { useState } from "react";
import { Github, MessageCircle, FileStack, Mail, Trash2, Loader2, Check } from "lucide-react";

const CONNECTORS = [
  { name: "GitHub", icon: Github, connected: true, detail: "3 repositories synced" },
  { name: "Slack", icon: MessageCircle, connected: true, detail: "#backend, #product" },
  { name: "Notion", icon: FileStack, connected: true, detail: "Engineering workspace" },
  { name: "Email", icon: Mail, connected: false, detail: "Not connected" },
];

export function SettingsView() {
  const [connectors, setConnectors] = useState(CONNECTORS);
  const [resetState, setResetState] = useState<"idle" | "confirm" | "loading" | "done" | "error">(
    "idle"
  );

  function toggle(name: string) {
    setConnectors((prev) =>
      prev.map((c) => (c.name === name ? { ...c, connected: !c.connected } : c))
    );
  }

  async function resetMemory() {
    setResetState("loading");
    try {
      const res = await fetch("/api/forget", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      setResetState("done");
      setTimeout(() => setResetState("idle"), 2500);
    } catch {
      setResetState("error");
      setTimeout(() => setResetState("idle"), 2500);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl bg-card/70 hairline p-6">
        <h2 className="mb-1 font-display text-[16px] text-warmwhite">Connected sources</h2>
        <p className="mb-5 text-[13px] text-muted">
          MemCore continuously builds memory from these sources.
        </p>
        <div className="space-y-2">
          {connectors.map(({ name, icon: Icon, connected, detail }) => (
            <div
              key={name}
              className="flex items-center justify-between rounded-xl bg-surface/60 hairline px-4 py-3.5"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-warmwhite">
                  <Icon size={15} />
                </span>
                <div>
                  <p className="text-[13.5px] text-warmwhite">{name}</p>
                  <p className="text-[11.5px] text-muted">{detail}</p>
                </div>
              </div>
              <button
                onClick={() => toggle(name)}
                className={`h-6 w-11 rounded-full transition-colors ${
                  connected ? "bg-emerald" : "bg-white/10"
                }`}
              >
                <span
                  className={`block h-5 w-5 translate-y-0.5 rounded-full bg-ink transition-transform ${
                    connected ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-card/70 hairline p-6">
        <h2 className="mb-1 font-display text-[16px] text-warmwhite">Memory engine</h2>
        <p className="text-[13px] text-muted">
          Running on Cognee in demo mode with a bundled dataset. Set{" "}
          <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[12px] font-mono">
            MEMCORE_USE_MOCK=false
          </code>{" "}
          once a live Cognee instance is connected.
        </p>
      </div>

      <div className="rounded-2xl bg-card/70 hairline p-6">
        <h2 className="mb-1 font-display text-[16px] text-warmwhite">Reset memory</h2>
        <p className="mb-4 text-[13px] text-muted">
          Permanently clears MemCore&apos;s dataset via Cognee&apos;s{" "}
          <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[12px] font-mono">
            forget()
          </code>{" "}
          call. This can&apos;t be undone.
        </p>
        {resetState === "confirm" ? (
          <div className="flex items-center gap-3">
            <button
              onClick={resetMemory}
              className="rounded-full bg-red-500/90 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-red-500"
            >
              Yes, clear everything
            </button>
            <button
              onClick={() => setResetState("idle")}
              className="rounded-full hairline bg-white/[0.03] px-4 py-2 text-[13px] text-warmwhite"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setResetState("confirm")}
            disabled={resetState === "loading"}
            className="inline-flex items-center gap-2 rounded-full hairline bg-white/[0.03] px-4 py-2 text-[13px] text-warmwhite transition-colors hover:border-red-400/40 hover:text-red-300 disabled:opacity-60"
          >
            {resetState === "loading" && <Loader2 size={14} className="animate-spin" />}
            {resetState === "done" && <Check size={14} className="text-emerald" />}
            {resetState === "idle" && <Trash2 size={14} />}
            {resetState === "loading"
              ? "Clearing…"
              : resetState === "done"
              ? "Memory cleared"
              : resetState === "error"
              ? "Failed — try again"
              : "Reset memory"}
          </button>
        )}
      </div>
    </div>
  );
}
