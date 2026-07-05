import { ArrowRight } from "lucide-react";
import { Reveal } from "./reveal";
import { MagneticButton } from "@/components/motion/magnetic-button";

export function CtaBanner() {
  return (
    <section className="border-t border-line/60 px-6 py-24 sm:py-28">
      <Reveal className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-b from-emerald-dim/50 to-card/40 hairline p-10 text-center sm:p-14">
        <h2 className="font-display text-[26px] text-warmwhite sm:text-[30px]">
          Stop losing what your team already knows
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-muted">
          Connect your sources, ask your first question, and see the graph build itself.
        </p>
        <MagneticButton
          href="/login"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald px-7 py-3.5 text-[14px] font-medium text-ink shadow-glow"
        >
          Enter Workspace <ArrowRight size={15} />
        </MagneticButton>
      </Reveal>
    </section>
  );
}
