"use client";

import { useEffect, useState } from "react";
import { UploadCloud, CheckCircle2, FileText } from "lucide-react";
import { MemoryNode } from "@/types/memory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRelativeTime } from "@/lib/utils";

export function DocumentsView() {
  const [documents, setDocuments] = useState<MemoryNode[] | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    fetch("/api/timeline")
      .then((r) => r.json())
      .then((d) => {
        const all = d.groups.flatMap((g: { items: MemoryNode[] }) => g.items);
        setDocuments(all.filter((n: MemoryNode) => n.type === "document"));
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setStatus("saving");
    await fetch("/api/remember", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, source: "manual-upload" }),
    });
    setStatus("saved");
    setTitle("");
    setContent("");
    setTimeout(() => setStatus("idle"), 2200);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        <h2 className="mb-4 text-[11.5px] font-medium uppercase tracking-wider text-emerald">
          Connected documents
        </h2>
        <div className="space-y-3">
          {documents?.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 rounded-2xl bg-card/70 hairline px-5 py-4"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-dim text-cyan">
                <FileText size={16} />
              </span>
              <div className="flex-1">
                <p className="font-display text-[14.5px] text-warmwhite">{doc.title}</p>
                <p className="text-[12px] text-muted">
                  {doc.source} · {formatRelativeTime(doc.timestamp)}
                </p>
              </div>
            </div>
          ))}
          {documents && documents.length === 0 && (
            <p className="text-[13px] text-muted">No documents connected yet.</p>
          )}
          {!documents && (
            <p className="text-[13px] text-muted">Loading connected documents…</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-surface/60 hairline p-6 h-fit">
        <div className="mb-4 flex items-center gap-2 text-warmwhite">
          <UploadCloud size={16} className="text-emerald" />
          <h3 className="font-display text-[15px]">Add to memory</h3>
        </div>
        <p className="mb-4 text-[12.5px] leading-relaxed text-muted">
          Paste a doc, meeting note, or markdown file. MemCore will connect it to related
          decisions and discussions automatically.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Paste content…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full rounded-xl bg-surface hairline px-4 py-3 text-sm text-warmwhite placeholder:text-muted focus-ring"
          />
          <Button type="submit" className="w-full" disabled={status === "saving"}>
            {status === "saved" ? (
              <>
                <CheckCircle2 size={15} /> Added to memory
              </>
            ) : status === "saving" ? (
              "Storing…"
            ) : (
              "Remember this"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
