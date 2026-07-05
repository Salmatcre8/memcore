import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { HeroVisual } from "@/components/landing/hero-visual";
import { Reveal } from "@/components/landing/reveal";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Integrations } from "@/components/landing/integrations";
import { About } from "@/components/landing/about";
import { ChainTeaser } from "@/components/landing/chain-teaser";
import { CtaBanner } from "@/components/landing/cta-banner";
import { Footer } from "@/components/landing/footer";
import { DriftingHeadline } from "@/components/motion/drifting-headline";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { CustomCursor } from "@/components/motion/custom-cursor";

export default function LandingPage() {
  return (
    <div className="relative">
      <CustomCursor />
      <Navbar />

      {/* HERO — vertically centered within the viewport minus the fixed
          navbar's height, so there's breathing room without a dead gap at
          any breakpoint. */}
      <section className="relative flex min-h-[calc(100vh-64px)] items-center overflow-hidden bg-radial-fade px-6 pb-16 pt-24 sm:pt-28">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full hairline bg-white/[0.03] px-3.5 py-1.5 text-[11.5px] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse-soft" />
              Powered by Cognee
            </span>
            <DriftingHeadline
              className="mt-6 font-display text-[38px] leading-[1.12] text-warmwhite sm:text-[46px] lg:text-[50px]"
              lines={[
                { content: "Your team's" },
                { content: <br key="br1" /> },
                { content: "collective memory," },
                { content: <br key="br2" /> },
                { content: "finally connected.", className: "text-emerald" },
              ]}
            />
            <p className="mt-5 max-w-md text-[15.5px] leading-relaxed text-muted">
              MemCore turns scattered meetings, docs, and conversations into a living
              memory your team can search, explore, and build upon.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <MagneticButton
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-emerald px-6 py-3 text-[14px] font-medium text-ink shadow-glow"
              >
                Enter Workspace <ArrowRight size={15} />
              </MagneticButton>
              <a
                href="#how-it-works"
                data-cursor="interactive"
                className="inline-flex items-center gap-2 rounded-full hairline bg-white/[0.03] px-6 py-3 text-[14px] text-warmwhite transition-colors hover:border-white/20"
              >
                See Demo
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <HeroVisual />
          </Reveal>
        </div>
      </section>

      <Features />
      <HowItWorks />
      <Integrations />
      <About />
      <ChainTeaser />
      <CtaBanner />
      <Footer />
    </div>
  );
}
