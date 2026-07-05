"use client";

import {
  FileText,
  UserRound,
  Code2,
  GitPullRequest,
  MessageSquare,
  GitCommitVertical,
  LucideIcon,
} from "lucide-react";

export interface OrbitNode {
  label: string;
  icon: LucideIcon;
  angle: number; // degrees, 0 = right, clockwise
  radius: number;
  tone: "emerald" | "cyan" | "violet";
  delay: number;
  floatDuration: number;
}

export const TONE_CLASSES: Record<OrbitNode["tone"], { bg: string; text: string; glow: string }> = {
  emerald: { bg: "bg-emerald-dim", text: "text-emerald", glow: "#34D399" },
  cyan: { bg: "bg-cyan-dim", text: "text-cyan", glow: "#7DD3FC" },
  violet: { bg: "bg-violet-dim", text: "text-violet", glow: "#A78BFA" },
};

// Each node gets its own float duration (in addition to its own delay) so
// the idle motion never reads as synchronized/robotic.
export const NODES: OrbitNode[] = [
  { label: "Meeting Notes", icon: FileText, angle: -90, radius: 168, tone: "violet", delay: 0, floatDuration: 6.2 },
  { label: "Alice", icon: UserRound, angle: -145, radius: 168, tone: "cyan", delay: 0.6, floatDuration: 5.4 },
  { label: "API Spec", icon: Code2, angle: -200, radius: 168, tone: "cyan", delay: 1.2, floatDuration: 7.1 },
  { label: "Slack Thread", icon: MessageSquare, angle: -255, radius: 168, tone: "violet", delay: 1.8, floatDuration: 6.7 },
  { label: "Decision", icon: GitCommitVertical, angle: -310, radius: 168, tone: "emerald", delay: 2.4, floatDuration: 5.9 },
  { label: "Design Doc", icon: FileText, angle: -35, radius: 168, tone: "violet", delay: 3.0, floatDuration: 6.5 },
  { label: "GitHub PR", icon: GitPullRequest, angle: 20, radius: 168, tone: "violet", delay: 3.6, floatDuration: 7.4 },
];

export const ORBIT_SIZE = 480;
export const ORBIT_CENTER = ORBIT_SIZE / 2;

export function pointOn(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: ORBIT_CENTER + radius * Math.cos(rad),
    y: ORBIT_CENTER + radius * Math.sin(rad),
  };
}

export function OrbitalGraph() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[480px]">
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(52,211,153,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.4) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(circle at center, black, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle at center, black, transparent 70%)",
        }}
      />

      <svg viewBox={`0 0 ${ORBIT_SIZE} ${ORBIT_SIZE}`} className="relative h-full w-full overflow-visible">
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#34D399" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
          </radialGradient>
        </defs>

        {NODES.map((n, i) => {
          const p = pointOn(n.angle, n.radius);
          return (
            <line
              key={n.label}
              x1={ORBIT_CENTER}
              y1={ORBIT_CENTER}
              x2={p.x}
              y2={p.y}
              stroke="#34D399"
              strokeWidth={1}
              opacity={0.25}
              className="animate-line-pulse"
              style={{ animationDelay: `${i * 0.4}s` }}
            />
          );
        })}

        <g className="origin-center animate-spin-slow" style={{ transformOrigin: "center", transformBox: "fill-box" }}>
          <circle cx={ORBIT_CENTER} cy={ORBIT_CENTER} r={168} fill="none" stroke="#23262F" strokeWidth={1} strokeDasharray="2 8" />
        </g>
        <g className="origin-center animate-spin-slow-reverse" style={{ transformOrigin: "center", transformBox: "fill-box" }}>
          <circle cx={ORBIT_CENTER} cy={ORBIT_CENTER} r={108} fill="none" stroke="#23262F" strokeWidth={1} strokeDasharray="1 6" />
        </g>

        <circle cx={ORBIT_CENTER} cy={ORBIT_CENTER} r={95} fill="url(#coreGlow)" className="animate-core-glow-drift" />
        <circle cx={ORBIT_CENTER} cy={ORBIT_CENTER} r={95} fill="url(#coreGlow)" className="animate-core-glow" opacity={0.6} />
        <g className="origin-center animate-spin-slow-reverse" style={{ transformOrigin: "center", transformBox: "fill-box" }}>
          {[0, 60, 120].map((rot) => {
            const pts = [0, 60, 120, 180, 240, 300].map((a) => pointOn(a + rot, 62));
            return (
              <polygon
                key={rot}
                points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="none"
                stroke="#34D399"
                strokeWidth={1}
                opacity={0.5}
              />
            );
          })}
        </g>
        <circle cx={ORBIT_CENTER} cy={ORBIT_CENTER} r={8} fill="#34D399" className="animate-pulse-soft" />
      </svg>

      {NODES.map((n) => {
        const p = pointOn(n.angle, n.radius);
        const tone = TONE_CLASSES[n.tone];
        const Icon = n.icon;
        return (
          <div
            key={n.label}
            data-cursor="interactive"
            className="absolute flex flex-col items-center gap-1.5 animate-float"
            style={{
              left: `${(p.x / ORBIT_SIZE) * 100}%`,
              top: `${(p.y / ORBIT_SIZE) * 100}%`,
              transform: "translate(-50%, -50%)",
              animationDelay: `${n.delay}s`,
              animationDuration: `${n.floatDuration}s`,
            }}
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone.bg} ${tone.text}`}
              style={{ boxShadow: `0 0 18px -4px ${tone.glow}` }}
            >
              <Icon size={16} />
            </span>
            <span className="whitespace-nowrap rounded-full bg-ink/70 px-2 py-0.5 text-[10.5px] text-muted backdrop-blur-sm">
              {n.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
