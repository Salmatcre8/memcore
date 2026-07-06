# MemCore

**The core of your team's collective memory**

Instead of digging through Slack, GitHub, Notion, and a dozen docs to remember *why* a decision was made, MemCore builds one connected knowledge graph out of everything your team discusses — so you can ask a plain-language question and get back not just **what** happened, but **why**.

[![Powered by Cognee](https://img.shields.io/badge/powered%20by-Cognee-34D399?style=flat-square)](https://www.cognee.ai/) [![Hackathon: Where's My Context?](https://img.shields.io/badge/hackathon-Where's%20My%20Context%3F-A78BFA?style=flat-square)](https://www.wemakedevs.org/hackathons/cognee)

> This repo is a complete, running Next.js app — landing page, authenticated workspace, real auth, and every API route — wired end to end against a bundled demo dataset so the whole product works immediately, with a documented path to plug in a real Cognee instance.

<img width="1345" height="640" alt="image" src="https://github.com/user-attachments/assets/d793e08a-63bc-4027-9ded-007a522ab278" />

---

## Why

AI tools and teams both suffer from the same problem: no persistent memory. Every conversation starts from zero, context gets lost the moment a chat window closes, and the *reasoning* behind a decision evaporates faster than the decision itself. MemCore treats memory as a first-class product feature — every meeting note, doc, and message becomes a node in a living graph that you can search, explore, and reason over.

## What it does

- **AI Memory Search** — ask a natural-language question, get an answer grounded in your team's actual history, not a generic LLM guess.
- **Explain This** — pick any decision or event and ask MemCore to reason about why it happened, tracing the connections that led there.
- **Knowledge Graph** — a real force-directed graph (`d3-force`, not a static layout) of everything your team knows. Drag nodes, zoom, pan, and hover to see what's connected to what.
- **Memory Timeline** — your team's history laid out chronologically, grouped and searchable.
- **Decision Explorer** — every important decision, with the memories and discussions that fed into it.
- **Documents** — ingest new memories (docs, notes, transcripts) directly into the graph.
- **Settings** — see connected sources and the live status of the memory engine.

## Try it in 60 seconds (demo mode, no external services needed)

```bash
npm install
cp .env.example .env.local
# generate a value for NEXTAUTH_SECRET:
openssl rand -base64 32
npm run dev
```

Open `http://localhost:3000`, click **Enter Workspace**, and sign in with:

```
ada@memcore.dev  or  femi@memcore.dev
password: memcore-demo
```

With `MEMCORE_USE_MOCK=true` (the default), search, "explain this", the knowledge graph, timeline, and decisions all run against a bundled, realistic demo dataset — no database or Cognee instance required.

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · d3-force · Lucide React · NextAuth.js · [Cognee](https://github.com/topoteretes/cognee) (official REST server, called directly — no custom backend) · deployed on Vercel.

## Authentication

Auth is real NextAuth.js (Credentials provider, JWT sessions), not a stub:

- `middleware.ts` protects everything under `/workspace/*` and redirects signed-out visitors to `/login`.
- `lib/demo-users.ts` is a seeded, bcrypt-hashed user store standing in for a real users table — swap it for a Postgres/Prisma lookup (or a different NextAuth provider, e.g. Google/GitHub OAuth) without touching `lib/auth.ts`.
- The sidebar reads the live session (name, sign-out) via `useSession()`.

## Architecture

```
User -> NextAuth session -> Next.js Frontend (fetch) -> Next.js API Routes
                                                           |
                                             MEMCORE_USE_MOCK ?
                                           +---------------+-----------------+
                                      MockCogneeClient              LiveCogneeClient
                                      (in-memory demo data)                |
                                                                    HTTP + Bearer token
                                                                           |
                                                          Cognee's own official REST server
                                                           (you run this — Docker or pip)
                                                                           |
                                                              SQLite + LanceDB + Kuzu
                                                              (or Postgres/Neo4j etc.)
```

```
app/
  page.tsx                  Landing page (hero, features, connection chain)
  login/                    NextAuth sign-in page
  workspace/                Authenticated app shell (sidebar + topbar)
    search/                 AI Memory Search + Explain This
    timeline/                Memory Timeline
    graph/                  Knowledge Graph — force-directed, drag/zoom/pan
    decisions/              Decision Explorer
    documents/               Documents + memory ingestion
    settings/                Connected sources + engine status
  api/
    auth/[...nextauth]/     NextAuth route handler
    remember/               POST — ingest a new memory
    search/                 POST — natural-language search
    explain/                POST — reasoning over a question
    graph/                  GET  — full knowledge graph
    timeline/               GET  — grouped chronological memories
    decisions/              GET  — decision records
    memory/[id]/            GET  — single memory lookup

components/         Shared UI primitives (button, card, badge, input), layout, motion, landing, providers
features/           Page-level feature components (search, graph, timeline, decisions, documents, settings)
services/cognee/    The Cognee boundary — client.ts (mock/live swap point, direct REST calls) + mock-data.ts
lib/                auth.ts, demo-users.ts, cn() helper, date formatting, memory-type -> icon/label map
types/              Shared MemoryNode / Decision / KnowledgeGraph types
```

- **Server Components by default.** Only pages/components that need interactivity (search input, graph drag/zoom, toggles, forms, session) are marked `"use client"`.
- **Business logic stays out of UI components.** Pages compose feature components; feature components call `fetch()` against API routes; API routes call `memoryClient`.
- **TypeScript strict mode** is on across the project.

## Knowledge Graph

`/workspace/graph` runs a real force simulation (`d3-force`: link, charge, center, and collide forces) rather than a fixed layout — nodes settle into place, you can drag any node to reposition it (physics reacts), scroll to zoom, and drag the canvas to pan. Hovering a node highlights everything it's connected to and dims the rest.

## Design system

Dark, calm, editorial — closer to Linear/Arc/Apple than an admin dashboard.

- **Palette:** ink `#09090B`, surface `#111318`, card `#171A21`, line `#23262F`, emerald accent `#34D399`, cyan secondary `#7DD3FC`, violet accent `#A78BFA`, warm white text `#F5F3EC`.
- **Type:** Fraunces (display/editorial serif, used sparingly for headlines), Inter (body/UI), JetBrains Mono (data, code, timestamps where needed).
- **Landing page:** fixed navbar with scroll blur, an orbital knowledge-graph hero visual (rotating rings, pulsing core, floating node chips), magnetic buttons, cursor-tilt cards, and scroll-triggered section reveals.

---

## Going live with Cognee — step by step

MemCore's live integration is built for **Cognee Cloud** ([platform.cognee.ai](https://platform.cognee.ai)) — that's what this section, and `services/cognee/client.ts`, are written and tested against. Cognee Cloud authenticates differently from a self-hosted server (`X-Api-Key` + `X-Tenant-Id` headers, not a Bearer token), so if you're self-hosting Cognee instead, `client.ts`'s auth layer will need adjusting.

### What you need

- **A Cognee Cloud account.** Sign up at [platform.cognee.ai](https://platform.cognee.ai).
- **An LLM key — probably not your own.** Cognee normally requires your own LLM provider key (OpenAI by default) since it doesn't ship a model. On Cognee Cloud specifically, this appears to be billed through Cognee itself rather than your own OpenAI account — check your workspace settings for a "bring your own LLM key" option before assuming you need one. If it's not there, you likely don't need an `OPENAI_API_KEY` at all.
- **Nothing else.** No Docker, no self-hosted server, no Postgres/Neo4j to run yourself — Cognee Cloud manages all of that.

### Step 1 — Get your three connection values

On the **API Keys** page in your Cognee Cloud workspace, find the **Connection Details** panel and copy:

| From the page | You'll use it as |
|---|---|
| **API Base URL** | `COGNEE_SERVICE_URL` |
| **Tenant ID** | `COGNEE_TENANT_ID` |
| A named key (create one, e.g. "memcore") | `COGNEE_API_KEY` |

### Step 2 — Test Cognee directly first, before touching Next.js

This step matters: confirm ingestion and search work with plain curl calls, so if something's wrong later you know immediately whether it's Cognee or MemCore's code.

```bash
BASE_URL="your API Base URL"
API_KEY="your named API key"
TENANT_ID="your Tenant ID"

# Ingest a test memory (also builds the graph — /remember does both in one call)
curl -X POST "$BASE_URL/api/v1/remember" \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Tenant-Id: $TENANT_ID" \
  -F "data=@-;filename=test.txt;type=text/plain" \
  -F "datasetName=memcore" \
  -F "run_in_background=false" <<< "We migrated to PostgreSQL for better write concurrency."

# Ask a question about it (takes a little longer — it's running an LLM)
curl -X POST "$BASE_URL/api/v1/search" \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Tenant-Id: $TENANT_ID" \
  -d '{"search_type": "GRAPH_COMPLETION", "query": "Why did we migrate to Postgres?", "datasets": ["memcore"], "top_k": 5}'
```

If that second call returns a real, on-topic answer, Cognee is fully working and the rest is just plumbing.

### Step 3 — Point MemCore at it

In `.env`:

```
MEMCORE_USE_MOCK=false
COGNEE_SERVICE_URL=https://tenant-xxxx....aws.cognee.ai
COGNEE_API_KEY=your-named-key
COGNEE_TENANT_ID=your-tenant-id
COGNEE_DATASET_NAME=memcore
```

Restart `npm run dev`. Every API route now flows through `LiveCogneeClient` in `services/cognee/client.ts`.

### What to expect once it's live

Cognee builds its graph by running an LLM over whatever text you feed it — it has no built-in idea of "meeting", "decision", "pull request", etc. Out of the box, live nodes will be **raw extracted entities** (people, concepts, organizations), not the tidy demo story MemCore ships with in mock mode. **That's expected, not a bug.**

A few things confirmed by testing against a live tenant that are worth knowing:

- **Search types are backend-dependent.** `INSIGHTS` isn't a valid `search_type` at all (Cognee returns the full valid enum in its error message if you try). `CYPHER` requires a graph-native backend (Neo4j, Ladybug) — it's rejected with a clear error on tenants using a Postgres graph backend. `TRIPLET_COMPLETION` runs your query through an LLM and returns a conversational sentence, not structured triplets, so it isn't useful for building a graph view either.
- **The knowledge graph view uses a separate, dedicated endpoint** — `GET /api/v1/datasets/{dataset_id}/graph` — not `/search` at all. It returns clean `{ nodes, edges }` directly. Since the app only knows the dataset *name*, `getGraph()` resolves the dataset ID first via a lightweight search call (whose response conveniently includes `dataset_id` next to `dataset_name`) before calling the graph endpoint.
- **`GET /api/v1/datasets`** (listing all datasets) returned an empty response in testing — that's why `getGraph()` doesn't depend on it.

### If something goes wrong

- **401/403 from Cognee** → double-check `COGNEE_API_KEY` and `COGNEE_TENANT_ID` are both set and copied exactly from the Connection Details panel — both headers are required, not just one.
- **Cognee itself returns odd/empty answers** → you queried before `/remember` finished processing (it can take anywhere from ~10 seconds to over a minute), or the dataset name doesn't match what you ingested into.
- **A `search_type` you're using gets rejected** → Cognee returns the full valid enum in the 422 error body; check it directly rather than assuming any value from this README or Cognee's own docs is current for your tenant/backend.
- **Getting a REST 404** → double check you're using the exact endpoint paths above; Cognee's REST API has changed shape across versions before.

`services/cognee/client.ts` is the **only** file that knows whether MemCore is on mock or live data, and it's marked `server-only` so it can never be imported into a Client Component by accident.

---

## Built with

Built for [The Hangover Part AI: Where's My Context?](https://www.wemakedevs.org/hackathons/cognee), a hackathon by [WeMakeDevs](https://www.wemakedevs.org/) centered on [Cognee](https://github.com/topoteretes/cognee)'s graph-vector AI memory platform.
