import { Decision, KnowledgeGraph, MemoryNode } from "@/types/memory";

/**
 * DEMO DATA
 * ---------
 * This file stands in for a live Cognee instance so the product can be
 * explored without a running memory engine or Postgres database. Every
 * record below is fabricated for demonstration purposes. Swap
 * `MEMCORE_USE_MOCK=false` and implement `services/cognee/client.ts`
 * against the real Cognee SDK to replace it with live data.
 */

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 60 * 60 * 1000).toISOString();
const daysAgo = (d: number) => hoursAgo(d * 24);

export const MOCK_NODES: MemoryNode[] = [
  {
    id: "mtg-01",
    type: "meeting",
    title: "Database scaling review",
    summary:
      "Backend team reviewed rising write latency on the events table and evaluated PostgreSQL vs. staying on the current managed MySQL cluster.",
    timestamp: daysAgo(2),
    source: "Google Meet",
    participants: ["Ada", "Femi", "Chidi"],
    tags: ["infrastructure", "database"],
  },
  {
    id: "dec-01",
    type: "decision",
    title: "Migrate to PostgreSQL",
    summary:
      "Team decided to migrate the primary data store to PostgreSQL to get native JSONB support and better write concurrency under the new event-ingestion load.",
    timestamp: daysAgo(2),
    source: "Decision Log",
    participants: ["Ada", "Femi"],
    tags: ["infrastructure", "database"],
  },
  {
    id: "pr-01",
    type: "pull_request",
    title: "#482 Add Postgres migration scripts",
    summary:
      "Introduces the schema migration, dual-write shim, and rollback plan referenced in the database scaling review.",
    timestamp: daysAgo(1),
    source: "GitHub",
    participants: ["Femi"],
    tags: ["database"],
  },
  {
    id: "doc-01",
    type: "document",
    title: "Postgres migration runbook",
    summary:
      "Step-by-step cutover plan: dual writes, backfill, validation queries, and the rollback trigger conditions.",
    timestamp: hoursAgo(20),
    source: "Notion",
    participants: ["Femi", "Chidi"],
    tags: ["database", "runbook"],
  },
  {
    id: "iss-01",
    type: "issue",
    title: "Write latency spikes above 400ms on peak hours",
    summary:
      "Original issue that triggered the scaling review; write latency on the events table exceeded SLA during evening peak traffic.",
    timestamp: daysAgo(5),
    source: "GitHub",
    participants: ["Chidi"],
    tags: ["performance", "database"],
  },
  {
    id: "person-femi",
    type: "person",
    title: "Femi",
    summary: "Backend engineer, owns the data platform and migration tooling.",
    timestamp: daysAgo(30),
    source: "Team",
  },
  {
    id: "mtg-02",
    type: "meeting",
    title: "Auth architecture sync",
    summary:
      "Discussion on moving from session cookies to short-lived JWTs with refresh rotation ahead of the mobile app launch.",
    timestamp: daysAgo(6),
    source: "Zoom",
    participants: ["Ada", "Tomi"],
    tags: ["authentication", "security"],
  },
  {
    id: "dec-02",
    type: "decision",
    title: "Adopt JWT with rotating refresh tokens",
    summary:
      "Chosen over long-lived sessions to support the upcoming mobile clients and reduce shared-session security risk.",
    timestamp: daysAgo(6),
    source: "Decision Log",
    participants: ["Ada", "Tomi"],
    tags: ["authentication", "security"],
  },
  {
    id: "pr-02",
    type: "pull_request",
    title: "#465 Implement refresh token rotation",
    summary: "Adds rotation, reuse detection, and revocation endpoint for the new auth flow.",
    timestamp: daysAgo(5),
    source: "GitHub",
    participants: ["Tomi"],
    tags: ["authentication"],
  },
  {
    id: "doc-02",
    type: "document",
    title: "Auth flow overview",
    summary: "Diagrams and sequence flow for login, refresh, and revocation across web and mobile.",
    timestamp: daysAgo(4),
    source: "Notion",
    participants: ["Tomi", "Ada"],
    tags: ["authentication"],
  },
  {
    id: "mtg-03",
    type: "meeting",
    title: "Caching layer retro",
    summary:
      "Retrospective on the Redis rollout: what worked, what needs tuning before the next traffic spike.",
    timestamp: daysAgo(10),
    source: "Google Meet",
    participants: ["Chidi", "Femi", "Ada"],
    tags: ["performance", "redis"],
  },
  {
    id: "dec-03",
    type: "decision",
    title: "Chose Redis over Memcached for session cache",
    summary:
      "Redis selected for built-in persistence and pub/sub, enabling cache invalidation events across services.",
    timestamp: daysAgo(11),
    source: "Decision Log",
    participants: ["Chidi", "Ada"],
    tags: ["redis", "infrastructure"],
  },
  {
    id: "doc-03",
    type: "document",
    title: "Onboarding: system architecture",
    summary: "New-hire reference covering services, data stores, and the deploy pipeline end to end.",
    timestamp: daysAgo(20),
    source: "Notion",
    participants: ["Ada"],
    tags: ["onboarding"],
  },
];

export const MOCK_GRAPH: KnowledgeGraph = {
  nodes: MOCK_NODES,
  edges: [
    { from: "iss-01", to: "mtg-01", relation: "prompted" },
    { from: "mtg-01", to: "dec-01", relation: "resulted in" },
    { from: "dec-01", to: "pr-01", relation: "implemented by" },
    { from: "pr-01", to: "doc-01", relation: "documented in" },
    { from: "doc-01", to: "person-femi", relation: "authored by" },
    { from: "mtg-02", to: "dec-02", relation: "resulted in" },
    { from: "dec-02", to: "pr-02", relation: "implemented by" },
    { from: "pr-02", to: "doc-02", relation: "documented in" },
    { from: "mtg-03", to: "dec-03", relation: "resulted in" },
  ],
};

export const MOCK_DECISIONS: Decision[] = [
  {
    id: "dec-01",
    title: "Migrate to PostgreSQL",
    summary: "Move the primary data store from managed MySQL to PostgreSQL.",
    reasoning:
      "Write latency on the events table breached SLA during peak hours. PostgreSQL's JSONB support removed the need for a separate document store, and its MVCC model handled the concurrent write pattern better in load tests than the existing MySQL cluster.",
    timestamp: daysAgo(2),
    peopleInvolved: ["Ada", "Femi", "Chidi"],
    relatedDocumentIds: ["doc-01"],
    relatedMeetingIds: ["mtg-01"],
    status: "active",
  },
  {
    id: "dec-02",
    title: "Adopt JWT with rotating refresh tokens",
    summary: "Replace long-lived session cookies with short-lived JWTs.",
    reasoning:
      "The mobile app launch required an auth model that did not depend on shared cookie storage. Rotating refresh tokens with reuse detection gave a stronger security posture without adding a session store dependency for mobile clients.",
    timestamp: daysAgo(6),
    peopleInvolved: ["Ada", "Tomi"],
    relatedDocumentIds: ["doc-02"],
    relatedMeetingIds: ["mtg-02"],
    status: "active",
  },
  {
    id: "dec-03",
    title: "Chose Redis over Memcached for session cache",
    summary: "Standardize on Redis for the shared session and rate-limit cache.",
    reasoning:
      "The team needed cache invalidation events across three services. Redis's pub/sub and optional persistence made it a better fit than Memcached, at the cost of slightly higher memory overhead per node.",
    timestamp: daysAgo(11),
    peopleInvolved: ["Chidi", "Ada"],
    relatedDocumentIds: ["doc-03"],
    relatedMeetingIds: ["mtg-03"],
    status: "revisited",
  },
];
