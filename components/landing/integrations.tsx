import { Github, MessageCircle, FileStack, Mail, Trello, Check } from "lucide-react";
import { Reveal } from "./reveal";
import { TiltCard } from "@/components/motion/tilt-card";

const SOURCES = [
  { name: "GitHub", icon: Github, detail: "Issues, PRs, and discussions" },
  { name: "Slack", icon: MessageCircle, detail: "Channels and threads" },
  { name: "Notion", icon: FileStack, detail: "Docs and wikis" },
  { name: "Linear", icon: Trello, detail: "Tickets and cycles" },
  { name: "Email", icon: Mail, detail: "Threads and decisions" },
];

export function Integrations() {
  return (
    <section id="integrations" className="border-t border-line/60 px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal className="text-center">
          <p className="mb-3 text-[11.5px] uppercase tracking-wider text-emerald">
            Works with what you already use
          </p>
          <h2 className="font-display text-[26px] text-warmwhite sm:text-[30px]">
            No migration. It just starts listening.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-muted">
            MemCore reads from the tools your team already lives in — nothing to copy, paste, or re-organize.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SOURCES.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.06}>
              <TiltCard className="flex h-full flex-col items-center gap-3 rounded-2xl bg-card/60 hairline px-4 py-6 text-center transition-colors hover:border-white/15">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-warmwhite">
                  <s.icon size={18} />
                </span>
                <div>
                  <p className="text-[13.5px] text-warmwhite">{s.name}</p>
                  <p className="mt-1 text-[11px] text-muted">{s.detail}</p>
                </div>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-dim px-2 py-0.5 text-[10px] text-emerald">
                  <Check size={10} /> Connected
                </span>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
