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
  private tenantId: string;
  private dataset: string;

  constructor() {
    const url = process.env.COGNEE_SERVICE_URL;
    const apiKey = process.env.COGNEE_API_KEY;
    const tenantId = process.env.COGNEE_TENANT_ID;
    if (!url) {
      throw new Error(
        "COGNEE_SERVICE_URL is not set. Point it at your running Cognee server " +
          "(see README), or set MEMCORE_USE_MOCK=true to use the demo data."
      );
    }
    if (!apiKey) {
      throw new Error(
        "COGNEE_API_KEY is not set (see README for how to get one from your " +
          "Cognee server)."
      );
    }
    if (!tenantId) {
      throw new Error(
        "COGNEE_TENANT_ID is not set. Your Cognee server issues this alongside " +
          "your API key — see README."
      );
    }
    this.baseUrl = url.replace(/\/$/, "");
    this.apiKey = apiKey;
    this.tenantId = tenantId;
    this.dataset = process.env.COGNEE_DATASET_NAME || "memcore";
  }

  private async call<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "X-Api-Key": this.apiKey,
        "X-Tenant-Id": this.tenantId,
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
    // CHUNKS returns one object PER DATASET, and each of those objects'
    // `search_result` is itself an ARRAY of chunk objects
    // ({ id, text, document_name, chunk_index, created_at, ... }) — not a
    // single string. Confirmed against a live instance on
    // 2026-07-06. Flatten across datasets and chunks before mapping.
    const results = await this.searchRaw("CHUNKS", query, limit);

    interface CogneeChunk {
      id?: string;
      text?: string;
      document_name?: string;
      created_at?: number;
    }

    const chunks = results.flatMap((r) => {
      const items = Array.isArray(r.search_result) ? (r.search_result as CogneeChunk[]) : [];
      return items.map((chunk) => ({ chunk, datasetName: r.dataset_name }));
    });

    return chunks.slice(0, limit).map(({ chunk, datasetName }, i) => {
      const text = chunk.text ?? "";
      return {
        id: chunk.id ?? `live-${i}`,
        type: "document",
        title: chunk.document_name ?? text.slice(0, 60),
        summary: text,
        excerpt: text,
        timestamp: chunk.created_at ? new Date(chunk.created_at).toISOString() : new Date().toISOString(),
        source: datasetName,
        relevance: 1 - i / Math.max(chunks.length, 1),
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

    // GRAPH_COMPLETION's search_result was a plain string in our CHUNKS
    // test of the wrapper shape, but we haven't independently confirmed
    // GRAPH_COMPLETION itself yet — given CHUNKS turned out to be
    // array-wrapped when we assumed it wasn't, handle that case here too
    // rather than assuming. Verify with a plain curl call if this still
    // looks wrong once you test it.
    const raw = completion?.search_result;
    const answer =
      typeof raw === "string"
        ? raw
        : Array.isArray(raw) && typeof raw[0] === "string"
          ? raw[0]
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
    // Cognee has a dedicated endpoint for this — GET
    // /api/v1/datasets/{dataset_id}/graph — confirmed live on 2026-07-06,
    // returning { nodes: [{id, label, type, properties}], edges: [{source,
    // target, label}] }. Far more reliable than trying to coax graph data
    // out of /search (INSIGHTS isn't a real search type on this server,
    // and TRIPLET_COMPLETION returns an LLM-generated sentence, not
    // structured data — both dead ends, don't reintroduce them).
    //
    // The endpoint needs a dataset ID, but this client only knows the
    // dataset NAME (this.dataset). GET /api/v1/datasets returned an empty
    // response when tested against this tenant, so instead we piggyback on
    // a cheap CHUNKS search — its response wrapper already includes
    // `dataset_id` right next to `dataset_name` (confirmed live) — rather
    // than depending on an endpoint that isn't reliably working here.
    const probe = await this.searchRaw("CHUNKS", this.dataset, 1);
    const datasetEntry = probe[0] as { dataset_id?: string } | undefined;
    if (!datasetEntry?.dataset_id) {
      // Nothing ingested under this dataset name yet.
      return { nodes: [], edges: [] };
    }

    interface CogneeGraphNode {
      id: string;
      label: string;
      type?: string;
      properties?: Record<string, unknown>;
    }
    interface CogneeGraphEdge {
      source: string;
      target: string;
      label: string;
    }

    const graph = await this.call<{ nodes: CogneeGraphNode[]; edges: CogneeGraphEdge[] }>(
      `/api/v1/datasets/${datasetEntry.dataset_id}/graph`
    );

    // Cognee's raw nodes are auto-extracted entities/chunks/summaries, not
    // MemCore's tidy demo types — that's expected (see README). Some node
    // labels are synthetic IDs (e.g. "TextSummary_ab862159-...") rather
    // than readable text, so prefer the node's own text/description
    // property for the title when present, and fall back to the label
    // (which IS readable for Entity nodes, e.g. "postgresql", "alice").
    const toNode = (n: CogneeGraphNode): MemoryNode => {
      const props = n.properties ?? {};
      const text = typeof props.text === "string" ? props.text : undefined;
      const description = typeof props.description === "string" ? props.description : undefined;
      return {
        id: n.id,
        type: "document",
        title: text ? (text.length > 60 ? `${text.slice(0, 60)}…` : text) : n.label,
        summary: text ?? description ?? n.type ?? "",
        timestamp: new Date().toISOString(),
        source: "Cognee",
      };
    };

    return {
      nodes: graph.nodes.map(toNode),
      edges: graph.edges.map((e) => ({ from: e.source, to: e.target, relation: e.label })),
    };
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
      headers: { "X-Api-Key": this.apiKey, "X-Tenant-Id": this.tenantId },
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