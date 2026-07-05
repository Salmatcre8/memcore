"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MagneticButton } from "@/components/motion/magnetic-button";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works", badge: "New" },
  { href: "#integrations", label: "Integrations" },
  { href: "#about", label: "About" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-line/70 bg-ink/75 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-dim text-emerald">
              <BrainCircuit size={16} />
            </span>
            <span className="font-display text-[15px] tracking-tight text-warmwhite">
              MemCore
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] text-muted transition-colors hover:text-warmwhite"
              >
                {link.label}
                {link.badge && (
                  <span className="rounded-full bg-emerald-dim px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-wide text-emerald">
                    {link.badge}
                  </span>
                )}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-[13px] text-warmwhite/90 transition-colors hover:text-warmwhite"
            >
              Log in
            </Link>
            <MagneticButton
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald px-4 py-2 text-[13px] font-medium text-ink"
            >
              Get Started
            </MagneticButton>
          </div>

          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-warmwhite md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-0 z-40 bg-ink/97 backdrop-blur-xl pt-24 px-6 md:hidden"
          >
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-4 text-[16px] text-warmwhite hairline border-b border-white/5"
                >
                  {link.label}
                  {link.badge && (
                    <span className="rounded-full bg-emerald-dim px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald">
                      {link.badge}
                    </span>
                  )}
                </a>
              ))}
            </nav>
            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="w-full rounded-full hairline bg-white/[0.03] px-4 py-3.5 text-center text-[14px] text-warmwhite"
              >
                Log in
              </Link>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="w-full rounded-full bg-emerald px-4 py-3.5 text-center text-[14px] font-medium text-ink"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
