import { MessagesSquare, GitBranch, FileStack, Mail } from "lucide-react";
import { Reveal } from "./reveal";

const SCATTERED_SOURCES = [
  { icon: MessagesSquare, label: "Slack threads" },
  { icon: GitBranch, label: "GitHub discussions" },
  { icon: FileStack, label: "Notion pages" },
  { icon: Mail, label: "Docs & emails" },
];

export function About() {
  return (
    <section id="about" className="border-t border-line/60 bg-surface/40 px-6 py-24 sm:py-28">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-14 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <p className="mb-3 text-[11.5px] uppercase tracking-wider text-emerald">Why MemCore</p>
          <h2 className="font-display text-[26px] leading-snug text-warmwhite sm:text-[30px]">
            Your team already knows the answer.
            <br />
            It&apos;s just scattered.
          </h2>
          <p className="mt-5 text-[14.5px] leading-relaxed text-muted">
            Modern teams lose valuable knowledge every day. Important context is split across
            Slack, GitHub, Notion, docs, and email — so decisions get forgotten, onboarding drags
            on, the same discussions repeat, and engineers burn hours searching through hundreds
            of messages for something the team already figured out once.
          </p>
          <p className="mt-4 text-[14.5px] leading-relaxed text-muted">
            MemCore is not another dashboard, project tool, or document viewer. It&apos;s a
            persistent memory layer, built on Cognee, that continuously connects your meetings,
            documents, discussions, and technical decisions into one living knowledge graph — so
            asking a question feels like talking to your organization&apos;s brain, not searching
            a database.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-3xl bg-card/60 hairline p-8 shadow-card">
            <p className="text-[11.5px] uppercase tracking-wide text-muted">
              Right now, that knowledge lives here
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {SCATTERED_SOURCES.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] px-3.5 py-3 hairline"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-dim text-emerald">
                    <s.icon size={15} />
                  </span>
                  <span className="text-[12.5px] text-warmwhite/85">{s.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-xl bg-emerald-dim/40 px-4 py-3.5 text-[12.5px] leading-relaxed text-emerald/90">
              MemCore reads all of it and builds one connected memory — nothing to migrate,
              nothing to re-organize.
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
