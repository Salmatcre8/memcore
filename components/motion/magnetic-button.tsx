"use client";

import { useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRef, useState, MouseEvent as ReactMouseEvent } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const MAGNETIC_RADIUS = 70;
const MAGNETIC_STRENGTH = 0.35;

function useMagnetic(reduceMotion: boolean | null) {
  const ref = useRef<HTMLElement | null>(null);
  const [style, setStyle] = useState<{ transform: string; light: string }>({
    transform: "translate(0px, 0px)",
    light: "",
  });

  function onMouseMove(e: ReactMouseEvent) {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const lightX = ((e.clientX - rect.left) / rect.width) * 100;
    const lightY = ((e.clientY - rect.top) / rect.height) * 100;
    const light = `radial-gradient(120px circle at ${lightX}% ${lightY}%, rgba(255,255,255,0.16), transparent 70%)`;

    if (dist < MAGNETIC_RADIUS) {
      setStyle({
        transform: `translate(${dx * MAGNETIC_STRENGTH}px, ${dy * MAGNETIC_STRENGTH}px)`,
        light,
      });
    } else {
      setStyle((s) => ({ transform: s.transform, light }));
    }
  }

  function onMouseLeave() {
    setStyle({ transform: "translate(0px, 0px)", light: "" });
  }

  return { ref, style, onMouseMove, onMouseLeave };
}

function useRipples() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  function spawn(e: ReactMouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const id = Date.now();
    setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => {
      setRipples((r) => r.filter((rp) => rp.id !== id));
    }, 600);
  }

  return { ripples, spawn };
}

export function MagneticButton({
  href,
  onClick,
  children,
  className,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const { ref, style, onMouseMove, onMouseLeave } = useMagnetic(reduceMotion);
  const { ripples, spawn } = useRipples();

  const content = (
    <>
      <span
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ background: style.light }}
      />
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute rounded-full bg-white/30"
          style={{
            left: r.x,
            top: r.y,
            width: 10,
            height: 10,
            transform: "translate(-50%, -50%)",
            animation: "ripple-burst 0.6s ease-out forwards",
          }}
        />
      ))}
      <span className="relative inline-flex items-center gap-2 whitespace-nowrap">{children}</span>
    </>
  );

  const sharedProps = {
    ref: ref as never,
    onMouseMove,
    onMouseLeave,
    onClick: (e: ReactMouseEvent) => {
      spawn(e);
      onClick?.();
    },
    className: `group relative isolate overflow-hidden transition-transform duration-200 ease-out hover:scale-[1.04] active:scale-[0.98] ${className ?? ""}`,
    style: { transform: style.transform, transition: "transform 0.15s ease-out" },
    "data-cursor": "interactive",
  };

  if (href) {
    return (
      <Link href={href} {...sharedProps}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" {...sharedProps}>
      {content}
    </button>
  );
}
