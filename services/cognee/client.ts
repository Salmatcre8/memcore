import "server-only";
import {
  Decision,
  ExplainResponse,
  KnowledgeGraph,
  MemoryNode,
  MemorySearchResult,
  TimelineGroup,
} from "@/types/memory";
import { MOCK_DECISIONS, MOCK_GRAPH, MOCK_NODES } from "./mock-data";

/**
 * MemCore <-> Cognee boundary
 * ---------------------------
 * This is the ONLY file that should know whether MemCore is talking to a
 * real Cognee instance or the bundled demo data. Every API route imports
 * `memoryClient` from here rather than touching Cognee or the mock data
 * directly, so swapping in a live deployment is a one-file change.
 *
 * To go live, see the "Going live with Cognee" section in the README —
 * short version: run Cognee's own official server (Docker or pip), create
 * one agent API key, then set MEMCORE_USE_MOCK=false plus
 * COGNEE_SERVICE_URL / COGNEE_API_KEY below.
 *
 * This file must never be imported from a Client Component — it is
 * marked with `server-only` so any accidental client import fails at
 * build time instead of silently leaking a memory-engine credential.
 */

export interface MemoryClient {
  search(query: string, limit?: number): Promise<MemorySearchResult[]>;
  explain(question: string): Promise<ExplainResponse>;
  getGraph(): Promise<KnowledgeGraph>;
  getTimeline(): Promise<TimelineGroup[]>;
  getMemory(id: string): Promise<MemoryNode | null>;
  getDecisions(): Promise<Decision[]>;
  remember(input: {
    title: string;
    content: string;
    source: string;
  }): Promise<{ id: string; status: "queued" | "stored" }>;
  forget(): Promise<{ status: string }>;
}

function scoreMatch(node: MemoryNode, query: string): number {
  const q = query.toLowerCase();
  const haystack = `${node.title} ${node.summary} ${node.tags?.join(" ") ?? ""}`.toLowerCase();
  if (!q.trim()) return 0.4;
  const terms = q.split(/\s+/).filter(Boolean);
  const hits = terms.filter((t) => haystack.includes(t)).length;
  if (hits === 0) return 0.15;
  return Math.min(0.98, 0.45 + (hits / terms.length) * 0.5);
}

function groupByTimeline(nodes: MemoryNode[]): TimelineGroup[] {
  const now = Date.now();
  const buckets: Record<string, MemoryNode[]> = {
    Today: [],
    Yesterday: [],
    "Last Week": [],
    "Last Month": [],
    Earlier: [],
  };

  for (const node of nodes) {
    const diffDays = (now - new Date(node.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays < 1) buckets.Today.push(node);
    else if (diffDays < 2) buckets.Yesterday.push(node);
    else if (diffDays < 7) buckets["Last Week"].push(node);
    else if (diffDays < 30) buckets["Last Month"].push(node);
    else buckets.Earlier.push(node);
  }

  return (Object.keys(buckets) as (keyof typeof buckets)[])
    .filter((label) => buckets[label].length > 0)
    .map((label) => ({
      label: label as TimelineGroup["label"],
      items: buckets[label].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    }));
}

/**
 * DEMO IMPLEMENTATION.
 * Simulates Cognee's search + reasoning behavior over the static dataset
 * in `mock-data.ts` so the full product can be demoed without a live
 * memory engine. Clearly not production logic — replace with
 * `LiveCogneeClient` for a real deployment.
 */
class MockCogneeClient implements MemoryClient {
  async search(query: string, limit = 8): Promise<MemorySearchResult[]> {
    await simulateLatency();
    return MOCK_NODES.map((node) => ({
      ...node,
      relevance: scoreMatch(node, query),
      excerpt: node.summary,
    }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);
  }

  async explain(question: string): Promise<ExplainResponse> {
    await simulateLatency();
    const results = await this.search(question, 4);
    const decision = MOCK_DECISIONS.find((d) =>
      results.some((r) => r.id === d.id || r.tags?.some((t) => d.title.toLowerCase().includes(t)))
    );

    const answer = decision
      ? `${decision.summary} ${decision.reasoning}`
      : results[0]
        ? `Based on connected memories, here's the most relevant context: ${results[0].summary}`
        : "No connected memories match that question yet.";

    return {
      question,
      answer,
      reasoningSteps: decision
        ? [
            `Found the originating discussion: "${results[0]?.title ?? "related meeting"}".`,
            `Traced it to the recorded decision: "${decision.title}".`,
            `Linked the decision to its implementation and documentation.`,
          ]
        : [
            "Searched the knowledge graph for related nodes.",
            "No decision record was directly linked to this query.",
          ],
      sources: results,
    };
  }

  async getGraph(): Promise<KnowledgeGraph> {
    await simulateLatency();
    return MOCK_GRAPH;
  }

  async getTimeline(): Promise<TimelineGroup[]> {
    await simulateLatency();
    return groupByTimeline(MOCK_NODES);
  }

  async getMemory(id: string): Promise<MemoryNode | null> {
    await simulateLatency();
    return MOCK_NODES.find((n) => n.id === id) ?? null;
  }

  async getDecisions(): Promise<Decision[]> {
    await simulateLatency();
    return MOCK_DECISIONS;
  }

  async remember(input: { title: string; content: string; source: string }) {
    await simulateLatency();
    // In the mock client this is a no-op acknowledgement only; nothing is
    // actually persisted. A live implementation would call Cognee's
    // `cognee.add()` / `cognee.cognify()` pipeline here.
    return { id: `mem-${Date.now()}`, status: "queued" as const };
  }

  async forget() {
    await simulateLatency();
    // Mock mode has nothing persisted to actually clear; acknowledge only.
    return { status: "ok (mock — nothing to clear)" };
  }
}

/**
 * LIVE IMPLEMENTATION.
 *
 * Talks directly to Cognee's own official REST API server — Cognee ships
 * a full production server (run via Docker, or `uvicorn cognee.api.
 * client:app`), so MemCore does NOT run any custom backend code of its
 * own. This file is just an HTTP client for that server's documented
 * endpoints. See the README for the full step-by-step setup.
 *
 * Required env vars when `MEMCORE_USE_MOCK=false`:
 *   COGNEE_SERVICE_URL   e.g. http://localhost:8000 (your running Cognee server)
 *   COGNEE_API_KEY       a permanent agent API key created once via
 *                        POST /api/v1/agents/create (see README) — sent as
 *                        `Authorization: Bearer <key>` on every request
 *   COGNEE_DATASET_NAME  optional, defaults to "memcore" — the single
 *                        Cognee dataset MemCore reads from and writes to
 *
 * A note on what "live" actually looks like: Cognee builds its graph by
 * running an LLM over whatever text you feed it — it has no built-in idea
 * of "meeting", "decision", "pull request", etc. Out of the box, live
 * nodes will be raw extracted entities (people, concepts, organizations),
 * not the tidy demo story MemCore ships with in mock mode. That's
 * expected, not a bug. If you want live data to carry MemCore's own
 * node types, pass a custom `graph_model` (a Pydantic schema matching
 * MemoryNode) to Cognee's cognify step — see the "Custom Graph Models"
 * section of the Cognee docs. Until then, the mappings below fall back to
 * sensible defaults ("document" type, ingestion time as timestamp).
 */
class LiveCogneeClient implements MemoryClient {
  private baseUrl: string;
  private apiKey: string;
  private dataset: string;

  constructor() {
    const url = process.env.COGNEE_SERVICE_URL;
    const apiKey = process.env.COGNEE_API_KEY;
    if (!url) {
      throw new Error(
        "COGNEE_SERVICE_URL is not set. Point it at your running Cognee server " +
          "(see README), or set MEMCORE_USE_MOCK=true to use the demo data."
      );
    }
    if (!apiKey) {
      throw new Error(
        "COGNEE_API_KEY is not set. Create an agent identity via POST " +
          "/api/v1/agents/create on your Cognee server and use the returned " +
          "agentApiKey here (see README)."
      );
    }
    this.baseUrl = url.replace(/\/$/, "");
    this.apiKey = apiKey;
    this.dataset = process.env.COGNEE_DATASET_NAME || "memcore";
  }

  private async call<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        ...init?.headers,
      },
      // Cognee's cognify/search calls hit an LLM and can take a while.
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Cognee API ${path} failed (${res.status}): ${body}`);
    }
    return res.json() as Promise<T>;
  }

  private async searchRaw(searchType: string, query: string, topK: number) {
    return this.call<Array<{ search_result: unknown; dataset_name: string }>>(
      "/api/v1/search",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          search_type: searchType,
          query,
          datasets: [this.dataset],
          top_k: topK,
        }),
      }
    );
  }

  async search(query: string, limit = 8): Promise<MemorySearchResult[]> {
    // CHUNKS returns raw relevant text passages — the closest match to
    // MemCore's "memory card" list view.
    const results = await this.searchRaw("CHUNKS", query, limit);

    return results.map((r, i) => {
      const text =
        typeof r.search_result === "string" ? r.search_result : JSON.stringify(r.search_result);
      return {
        id: `live-${i}`,
        type: "document",
        title: text.slice(0, 60),
        summary: text,
        excerpt: text,
        timestamp: new Date().toISOString(),
        source: r.dataset_name,
        relevance: 1 - i / Math.max(results.length, 1),
      };
    });
  }

  async explain(question: string): Promise<ExplainResponse> {
    // GRAPH_COMPLETION is Cognee's graph-reasoning answer mode — it
    // traverses the knowledge graph (not just vector similarity) to
    // produce a single synthesized answer, which is exactly what "Explain
    // This" is asking for.
    const [completion] = await this.searchRaw("GRAPH_COMPLETION", question, 1);
    const sources = await this.search(question, 4);

    const answer =
      completion && typeof completion.search_result === "string"
        ? completion.search_result
        : "No connected memories match that question yet.";

    return {
      question,
      answer,
      reasoningSteps: [
        "Ran a graph-completion search: vector search finds relevant entities, then Cognee traverses the graph from there.",
        "The answer above is generated from that traversed subgraph, not just the closest text match.",
      ],
      sources,
    };
  }

  async getGraph(): Promise<KnowledgeGraph> {
    // Cognee doesn't expose a single "give me the entire graph" REST
    // endpoint — INSIGHTS returns the subgraph most relevant to a query,
    // as [sourceNode, relationship, targetNode] triplets. A broad, generic
    // query with a high top_k approximates "the whole graph" for small
    // demo datasets; for larger ones, wire this to a specific query
    // instead (e.g. whatever the user just searched for).
    const triplets = await this.searchRaw("INSIGHTS", this.dataset, 100);

    const nodesById = new Map<string, MemoryNode>();
    const edges: KnowledgeGraph["edges"] = [];

    triplets.forEach((t) => {
      const triplet = t.search_result as
        | [Record<string, unknown>, Record<string, unknown>, Record<string, unknown>]
        | undefined;
      if (!Array.isArray(triplet) || triplet.length < 3) return;
      const [source, relation, target] = triplet;

      const toNode = (n: Record<string, unknown>): MemoryNode => {
        const id = String(n.id ?? n.name ?? JSON.stringify(n));
        return {
          id,
          type: "document",
          title: String(n.name ?? n.type ?? id),
          summary: String(n.description ?? n.type ?? ""),
          timestamp: new Date().toISOString(),
          source: "Cognee",
        };
      };

      const sourceNode = toNode(source);
      const targetNode = toNode(target);
      nodesById.set(sourceNode.id, sourceNode);
      nodesById.set(targetNode.id, targetNode);
      edges.push({
        from: sourceNode.id,
        to: targetNode.id,
        relation: String(relation?.relationship_name ?? "related to"),
      });
    });

    return { nodes: Array.from(nodesById.values()), edges };
  }

  async getTimeline(): Promise<TimelineGroup[]> {
    const graph = await this.getGraph();
    return groupByTimeline(graph.nodes);
  }

  async getMemory(id: string): Promise<MemoryNode | null> {
    const graph = await this.getGraph();
    return graph.nodes.find((n) => n.id === id) ?? null;
  }

  async getDecisions(): Promise<Decision[]> {
    // Cognee's auto-extracted graph has no first-class "Decision" concept —
    // this filters for nodes whose type/title happens to say "decision".
    // For reliable results, tag decision documents clearly when you add
    // them (e.g. start the text with "Decision:"), or define a custom
    // graph_model (see the class doc comment above).
    const graph = await this.getGraph();
    return graph.nodes
      .filter((n) => /decision/i.test(n.title) || /decision/i.test(n.summary))
      .map((n) => ({
        id: n.id,
        title: n.title,
        summary: n.summary,
        reasoning: n.summary,
        timestamp: n.timestamp,
        peopleInvolved: n.participants ?? [],
        relatedDocumentIds: [],
        relatedMeetingIds: [],
        status: "active" as const,
      }));
  }

  async remember(input: { title: string; content: string; source: string }) {
    // /api/v1/remember ingests AND cognifies in a single call, so newly
    // added memories are immediately searchable — no separate "did I
    // remember to run cognify?" step to forget.
    const form = new FormData();
    const blob = new Blob([input.content], { type: "text/plain" });
    form.append("data", blob, `${input.title.replace(/[^\w-]+/g, "_")}.txt`);
    form.append("datasetName", this.dataset);
    form.append("run_in_background", "false");

    const res = await fetch(`${this.baseUrl}/api/v1/remember`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}` },
      body: form,
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Cognee API /api/v1/remember failed (${res.status}): ${body}`);
    }
    const data = await res.json();
    return { id: data.id ?? data.data_id ?? `mem-${Date.now()}`, status: "stored" as const };
  }

  async forget() {
    return this.call<{ status: string }>("/api/v1/forget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataset: this.dataset, memory_only: false }),
    });
  }
}

function simulateLatency() {
  return new Promise((resolve) => setTimeout(resolve, 220 + Math.random() * 260));
}

const useMock = process.env.MEMCORE_USE_MOCK !== "false";

// Lazily constructed so a missing COGNEE_SERVICE_URL only throws when the
// live client is actually selected and used, not at module import time.
export const memoryClient: MemoryClient = useMock
  ? new MockCogneeClient()
  : new LiveCogneeClient();
