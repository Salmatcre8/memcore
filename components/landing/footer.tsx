import Link from "next/link";
import { BrainCircuit } from "lucide-react";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Integrations", href: "#integrations" },
    ],
  },
  {
    title: "Workspace",
    links: [
      { label: "Search", href: "/workspace/search" },
      { label: "Knowledge Graph", href: "/workspace/graph" },
      { label: "Decisions", href: "/workspace/decisions" },
    ],
  },
  {
    title: "Company",
    links: [{ label: "About", href: "#about" }],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line/60 px-6 py-16">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-10 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-dim text-emerald">
              <BrainCircuit size={16} />
            </span>
            <span className="font-display text-[15px] text-warmwhite">MemCore</span>
          </div>
          <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
            The core of your team&apos;s collective memory.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-[11.5px] uppercase tracking-wide text-muted">{col.title}</p>
            <div className="mt-3 flex flex-col gap-2.5">
              {col.links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-[13px] text-warmwhite/80 transition-colors hover:text-emerald"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 max-w-5xl border-t border-line/60 pt-6 text-center text-[11.5px] text-muted">
        © {new Date().getFullYear()} MemCore. Powered by Cognee.
      </div>
    </footer>
  );
}
