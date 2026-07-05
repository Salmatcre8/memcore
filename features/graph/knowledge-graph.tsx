"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  Simulation,
  SimulationNodeDatum,
} from "d3-force";
import { motion } from "framer-motion";
import { KnowledgeGraph, MemoryNode } from "@/types/memory";
import { MEMORY_TYPE_META } from "@/lib/memory-meta";
import { formatRelativeTime } from "@/lib/utils";

interface SimNode extends SimulationNodeDatum, MemoryNode {
  id: string;
}

interface SimLink {
  source: string | SimNode;
  target: string | SimNode;
  relation: string;
}

const WIDTH = 900;
const HEIGHT = 620;
const NODE_RADIUS = 24;

export function KnowledgeGraphView() {
  const [graph, setGraph] = useState<KnowledgeGraph | null>(null);
  const [nodes, setNodes] = useState<SimNode[]>([]);
  const [links, setLinks] = useState<SimLink[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const svgRef = useRef<SVGSVGElement | null>(null);
  const simRef = useRef<Simulation<SimNode, SimLink> | null>(null);
  const dragState = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const panState = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    fetch("/api/graph")
      .then((r) => r.json())
      .then(setGraph);
  }, []);

  useEffect(() => {
    if (!graph) return;

    const simNodes: SimNode[] = graph.nodes.map((n, i) => ({
      ...n,
      x: WIDTH / 2 + Math.cos((i / graph.nodes.length) * Math.PI * 2) * 180,
      y: HEIGHT / 2 + Math.sin((i / graph.nodes.length) * Math.PI * 2) * 180,
    }));
    const simLinks: SimLink[] = graph.edges.map((e) => ({
      source: e.from,
      target: e.to,
      relation: e.relation,
    }));

    const sim = forceSimulation(simNodes)
      .force(
        "link",
        forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance(140)
          .strength(0.6)
      )
      .force("charge", forceManyBody().strength(-320))
      .force("center", forceCenter(WIDTH / 2, HEIGHT / 2))
      .force("collide", forceCollide(NODE_RADIUS + 14))
      .alpha(1)
      .alphaDecay(0.02)
      .on("tick", () => setTick((t) => t + 1));

    simRef.current = sim;
    setNodes(simNodes);
    setLinks(simLinks);

    return () => {
      sim.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph]);

  const nodeById = useMemo(() => {
    const map = new Map<string, SimNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, tick]);

  const connectedIds = useMemo(() => {
    if (!activeId) return new Set<string>();
    const set = new Set<string>([activeId]);
    links.forEach((l) => {
      const s = typeof l.source === "string" ? l.source : l.source.id;
      const t = typeof l.target === "string" ? l.target : l.target.id;
      if (s === activeId) set.add(t);
      if (t === activeId) set.add(s);
    });
    return set;
  }, [activeId, links]);

  const active = activeId ? nodeById.get(activeId) : null;

  const toSvgPoint = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      const px = ((clientX - rect.left) / rect.width) * WIDTH;
      const py = ((clientY - rect.top) / rect.height) * HEIGHT;
      return { x: (px - transform.x) / transform.k, y: (py - transform.y) / transform.k };
    },
    [transform]
  );

  function handleNodePointerDown(e: React.PointerEvent, node: SimNode) {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    const p = toSvgPoint(e.clientX, e.clientY);
    dragState.current = { id: node.id, offsetX: (node.x ?? 0) - p.x, offsetY: (node.y ?? 0) - p.y };
    node.fx = node.x;
    node.fy = node.y;
    simRef.current?.alphaTarget(0.3).restart();
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (dragState.current) {
      const node = nodeById.get(dragState.current.id);
      if (node) {
        const p = toSvgPoint(e.clientX, e.clientY);
        node.fx = p.x + dragState.current.offsetX;
        node.fy = p.y + dragState.current.offsetY;
      }
      return;
    }
    if (panState.current) {
      const dx = e.clientX - panState.current.startX;
      const dy = e.clientY - panState.current.startY;
      setTransform((t) => ({ ...t, x: panState.current!.ox + dx, y: panState.current!.oy + dy }));
    }
  }

  function handlePointerUp() {
    if (dragState.current) {
      const node = nodeById.get(dragState.current.id);
      if (node) {
        node.fx = null;
        node.fy = null;
      }
      dragState.current = null;
      simRef.current?.alphaTarget(0);
    }
    panState.current = null;
  }

  function handleBackgroundPointerDown(e: React.PointerEvent) {
    panState.current = {
      startX: e.clientX,
      startY: e.clientY,
      ox: transform.x,
      oy: transform.y,
    };
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    setTransform((t) => ({ ...t, k: Math.min(2.2, Math.max(0.5, t.k + delta)) }));
  }

  if (!graph) {
    return (
      <div className="flex h-96 items-center justify-center text-muted text-sm">
        Connecting to the knowledge graph…
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="relative overflow-hidden rounded-2xl bg-surface/40 hairline">
        <div className="absolute right-3 top-3 z-10 flex gap-1.5 text-[11px] text-muted">
          <span className="rounded-full bg-ink/60 px-2.5 py-1 hairline">
            drag nodes · scroll to zoom · drag canvas to pan
          </span>
        </div>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-[560px] w-full touch-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerDown={handleBackgroundPointerDown}
          onWheel={handleWheel}
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="5.5"
              markerHeight="5.5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#34D399" opacity={0.55} />
            </marker>
          </defs>

          <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
            {links.map((l, i) => {
              const s = typeof l.source === "string" ? nodeById.get(l.source) : (l.source as SimNode);
              const t = typeof l.target === "string" ? nodeById.get(l.target) : (l.target as SimNode);
              if (!s || !t || s.x == null || t.x == null) return null;
              const sId = typeof l.source === "string" ? l.source : l.source.id;
              const tId = typeof l.target === "string" ? l.target : l.target.id;
              const dimmed = activeId ? !(connectedIds.has(sId) && connectedIds.has(tId)) : false;
              return (
                <g key={i}>
                  <line
                    x1={s.x}
                    y1={s.y}
                    x2={t.x}
                    y2={t.y}
                    stroke={dimmed ? "#23262F" : "#34D399"}
                    strokeWidth={dimmed ? 1 : 1.6}
                    opacity={dimmed ? 0.3 : 0.65}
                    markerEnd="url(#arrow)"
                  />
                  <text
                    x={(s.x! + t.x!) / 2}
                    y={(s.y! + t.y!) / 2 - 5}
                    textAnchor="middle"
                    fontSize="9.5"
                    fill={dimmed ? "#3a3d47" : "#8B8F99"}
                  >
                    {l.relation}
                  </text>
                </g>
              );
            })}

            {nodes.map((node) => {
              const meta = MEMORY_TYPE_META[node.type];
              const Icon = meta.icon;
              const dimmed = activeId ? !connectedIds.has(node.id) : false;
              const isActive = node.id === activeId;
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x ?? 0}, ${node.y ?? 0})`}
                  className="cursor-grab active:cursor-grabbing"
                  onPointerDown={(e) => handleNodePointerDown(e, node)}
                  onMouseEnter={() => setActiveId(node.id)}
                  onMouseLeave={() => setActiveId(null)}
                >
                  <circle
                    r={NODE_RADIUS}
                    fill={isActive ? "#171A21" : "#111318"}
                    stroke={isActive ? "#34D399" : "#23262F"}
                    strokeWidth={isActive ? 2 : 1}
                    opacity={dimmed ? 0.35 : 1}
                  />
                  <foreignObject x={-13} y={-13} width={26} height={26} className="pointer-events-none">
                    <div
                      className="flex h-[26px] w-[26px] items-center justify-center"
                      style={{ color: dimmed ? "#3a3d47" : "#34D399" }}
                    >
                      <Icon size={13} />
                    </div>
                  </foreignObject>
                  <text
                    y={NODE_RADIUS + 15}
                    textAnchor="middle"
                    fontSize="10"
                    fill={dimmed ? "#3a3d47" : "#F5F3EC"}
                    className="select-none"
                  >
                    {node.title.length > 20 ? node.title.slice(0, 18) + "…" : node.title}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <motion.div
        key={active?.id ?? "empty"}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-2xl bg-card/70 hairline p-6 h-fit"
      >
        {active ? (
          <NodeDetail node={active} />
        ) : (
          <div className="text-[13px] text-muted">
            Hover a node to trace its connections. Drag nodes to rearrange the graph,
            scroll to zoom, or drag the canvas to pan.
          </div>
        )}
      </motion.div>
    </div>
  );
}

function NodeDetail({ node }: { node: MemoryNode }) {
  const meta = MEMORY_TYPE_META[node.type];
  const Icon = meta.icon;
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-dim text-emerald">
          <Icon size={15} />
        </span>
        <span className="text-[11.5px] uppercase tracking-wide text-muted">{meta.label}</span>
      </div>
      <h3 className="font-display text-[17px] text-warmwhite">{node.title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">{node.summary}</p>
      <p className="mt-4 text-[11.5px] text-muted">
        {node.source} · {formatRelativeTime(node.timestamp)}
      </p>
      {node.participants && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {node.participants.map((p) => (
            <span key={p} className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[11px] text-warmwhite">
              {p}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
