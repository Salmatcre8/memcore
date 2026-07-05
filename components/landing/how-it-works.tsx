import { Plug, Waypoints, MessageCircleQuestion } from "lucide-react";
import { Reveal } from "./reveal";

const STEPS = [
  {
    icon: Plug,
    title: "Connect your sources",
    copy: "Point MemCore at Slack, GitHub, Notion, and your docs. It starts listening in the background — nothing to migrate, nothing to re-type.",
  },
  {
    icon: Waypoints,
    title: "It builds the graph for you",
    copy: "Cognee continuously links meetings to decisions, decisions to pull requests, and pull requests to documentation as they happen.",
  },
  {
    icon: MessageCircleQuestion,
    title: "Ask it anything",
    copy: "Skip the keyword search. Ask a real question in plain language and get the answer, the source, and the reasoning behind it.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-line/60 bg-surface/40 px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal className="text-center">
          <p className="mb-3 text-[11.5px] uppercase tracking-wider text-emerald">
            How it works
          </p>
          <h2 className="font-display text-[26px] text-warmwhite sm:text-[30px]">
            From scattered chatter to searchable memory
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.12} className="relative text-center sm:text-left">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-dim text-emerald sm:mx-0">
                <step.icon size={18} />
              </div>
              <p className="mt-5 font-mono text-[11px] text-emerald/70">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-1.5 font-display text-[17px] text-warmwhite">{step.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{step.copy}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
