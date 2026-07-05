"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

interface DriftLine {
  content: ReactNode;
  className?: string;
}

/**
 * Renders each line with its own barely-there x/y wander and breathing
 * scale, independently timed so lines never move in lockstep. Every line
 * is fully visible from first paint -- this is not a reveal/entrance
 * animation, just ambient life once the text is already on screen.
 */
export function DriftingHeadline({ lines, as: Tag = "h1", className }: {
  lines: DriftLine[];
  as?: "h1" | "h2";
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <Tag className={className}>
      {lines.map((line, i) => {
        if (reduceMotion) {
          return (
            <span key={i} className={line.className}>
              {line.content}
            </span>
          );
        }
        const dx = 1.4 + (i % 3) * 0.4;
        const dy = 1.1 + ((i + 1) % 3) * 0.5;
        const duration = 7 + i * 1.3;
        return (
          <motion.span
            key={i}
            className={line.className}
            style={{ display: "inline-block", willChange: "transform" }}
            animate={{
              x: [0, dx, -dx * 0.6, 0],
              y: [0, -dy, dy * 0.5, 0],
              scale: [1, 1.006, 0.997, 1],
            }}
            transition={{
              duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          >
            {line.content}
          </motion.span>
        );
      })}
    </Tag>
  );
}
