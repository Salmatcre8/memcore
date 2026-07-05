import { Search, Waypoints, BrainCircuit, Sparkles, History } from "lucide-react";
import { Reveal } from "./reveal";
import { TiltCard } from "@/components/motion/tilt-card";

const FEATURES = [
  {
    icon: Search,
    title: "AI Memory Search",
    copy: "Ask a question in plain language and get an answer pulled from every meeting, doc, and discussion — not a list of files to dig through.",
  },
  {
    icon: Waypoints,
    title: "Knowledge Graph",
    copy: "See how a meeting became a decision, how that decision became a pull request, and how the pull request became documentation.",
  },
  {
    icon: BrainCircuit,
    title: "Decision Explorer",
    copy: "Every technical decision, with the reasoning behind it, the people involved, and everything it touched.",
  },
  {
    icon: Sparkles,
    title: "Explain This",
    copy: "Not just what happened — why. MemCore traces cause and effect across your team's history.",
  },
  {
    icon: History,
    title: "Memory Timeline",
    copy: "A living, chronological record of your team's work — today, yesterday, last week, last month.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-line/60 bg-surface/30 px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal className="text-center">
          <p className="mb-3 text-[11.5px] uppercase tracking-wider text-emerald">
            What lives inside
          </p>
          <h2 className="font-display text-[26px] text-warmwhite sm:text-[30px]">
            Not a dashboard. A memory.
          </h2>
        </Reveal>
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, copy }, i) => (
            <Reveal key={title} delay={i * 0.06}>
              <TiltCard className="h-full rounded-2xl bg-card/60 hairline p-6 shadow-card transition-colors hover:border-white/15">
                <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-dim text-emerald">
                  <Icon size={16} />
                </span>
                <h3 className="font-display text-[16px] text-warmwhite">{title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{copy}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
