"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { OrbitalGraph } from "./orbital-graph";

/**
 * Tracks this component's own scroll range (top of hero visual entering
 * the viewport -> leaving the top of the viewport) and fades/scales the
 * graph out as the hero gives way to Features — a light, dependency-free
 * scroll effect (no particle canvas) that never fires more than once per
 * scroll pass. Every other section keeps the plain fade/slide reveal from
 * <Reveal />.
 */
export function HeroVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.7, 1], [1, 1, 0.94]);

  return (
    <div ref={containerRef} className="relative">
      <motion.div style={reduceMotion ? undefined : { opacity, scale }} className="relative">
        <OrbitalGraph />
      </motion.div>
    </div>
  );
}
