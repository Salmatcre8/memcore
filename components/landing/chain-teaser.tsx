import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./reveal";

const CHAIN = ["Meeting", "Decision", "GitHub PR", "Documentation", "Developer"];

export function ChainTeaser() {
  return (
    <section className="border-t border-line/60 bg-surface/40 px-6 py-24 sm:py-28">
      <Reveal className="mx-auto max-w-4xl text-center">
        <p className="mb-3 text-[11.5px] uppercase tracking-wider text-emerald">
          Everything connected
        </p>
        <h2 className="font-display text-[26px] text-warmwhite sm:text-[30px]">
          One meeting becomes a full story
        </h2>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {CHAIN.map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <span className="rounded-full hairline bg-card/70 px-4 py-2 text-[13px] text-warmwhite">
                {step}
              </span>
              {i < CHAIN.length - 1 && <ArrowRight size={14} className="text-emerald" />}
            </div>
          ))}
        </div>
        <Link
          href="/workspace/graph"
          className="mt-10 inline-flex items-center gap-2 text-[13.5px] text-emerald hover:underline"
        >
          Explore the full graph <ArrowRight size={13} />
        </Link>
      </Reveal>
    </section>
  );
}
