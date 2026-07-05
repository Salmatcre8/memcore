# MemCore

**The core of your team's collective memory.**

MemCore is an AI-powered Team Memory Hub. Instead of searching Slack, GitHub,
Notion, and docs separately, MemCore builds one connected knowledge graph —
so you can ask a plain-language question and get back not just *what*
happened, but *why*.

This repo is a complete, running Next.js app: landing page, authenticated
workspace (search, timeline, force-directed knowledge graph, decision
explorer, documents, settings), NextAuth login, and every API route —
wired end to end against a bundled demo dataset so the whole product works
immediately, with a clean, documented path to plug in a real
[Cognee](https://www.cognee.ai/) instance.

## Quick start (demo mode — no external services needed)

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

`MEMCORE_USE_MOCK=true` (the default) means search, "explain this", the
knowledge graph, timeline, and decisions all run against a bundled, realistic
demo dataset — no database or Cognee instance required.

## Authentication

Auth is real NextAuth.js (Credentials provider, JWT sessions), not a stub:

- `middleware.ts` protects everything under `/workspace/*` and redirects
  signed-out visitors to `/login`.
- `lib/demo-users.ts` is a seeded, bcrypt-hashed user store standing in for a
  real users table — swap it for a Postgres/Prisma lookup (or a different
  NextAuth provider, e.g. Google/GitHub OAuth) without touching `lib/auth.ts`.
- The sidebar reads the live session (name, sign-out) via `useSession()`.

## Going live with Cognee — step by step

Cognee ships its **own official, production REST API server** — MemCore
does not run any custom backend code of its own. `services/cognee/client.ts`
is just an HTTP client for Cognee's documented endpoints. This means there's
one less thing to build and one less thing to break.

### What you need

- **A Cognee server.** You run this yourself (Docker or Python) — it's not
  a hosted API Anthropic or MemCore provides.
- **An LLM provider API key — this is required, not optional.** Cognee
  doesn't include its own model; it calls an LLM to build the graph
  (`cognify`) and an embedding model for search. By default both come from
  **OpenAI**, so at minimum you need an `OPENAI_API_KEY`. (Cognee also
  supports Anthropic, Gemini, Ollama/local models, and others — see
  Cognee's LLM Provider docs if you want to avoid OpenAI specifically.)
- **Nothing else.** The default local setup uses SQLite (metadata), LanceDB
  (vectors), and Kuzu (graph) — all embedded, file-based, no Postgres/Neo4j/
  Docker Compose stack required unless you choose to scale up later.

### Step 1 — Run Cognee's server

**Option A: Docker (recommended, simplest).**

```bash
git clone https://github.com/topoteretes/cognee.git
cd cognee
cp .env.template .env
```

Edit `.env` and set at minimum:

```
LLM_API_KEY=sk-...your-openai-key...
```

Then:

```bash
docker compose up --build cognee
```

The server is now running at `http://localhost:8000`. Confirm it's alive:

```bash
curl http://localhost:8000/health
```

Interactive API docs (handy for double-checking the exact request/response
shape on whichever Cognee version you're running) are at
`http://localhost:8000/docs`.

**Option B: Local Python, no Docker.**

```bash
git clone https://github.com/topoteretes/cognee.git
cd cognee
uv venv && source .venv/bin/activate    # or: python -m venv .venv && source .venv/bin/activate
uv sync --all-extras                    # or: pip install "cognee[api]"
cp .env.template .env                   # then set LLM_API_KEY in it, as above
uvicorn cognee.api.client:app --host 0.0.0.0 --port 8000
```

### Step 2 — Create one permanent API key for MemCore

Cognee's REST server expects a Bearer token on every request. Rather than
having the Next.js app log in on every request, create one **agent identity**
— a permanent, service-style API key meant exactly for this (Cognee agent
keys don't expire or need refreshing the way a user login token does).

```bash
# 1. Register an admin user (one time only)
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@memcore.local", "password": "choose-a-strong-password"}'

# 2. Log in to get a short-lived token
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=admin@memcore.local&password=choose-a-strong-password' | jq -r .access_token)

# 3. Create a permanent agent key for MemCore — SAVE THE OUTPUT, it is
#    shown once and cannot be retrieved again
curl -X POST "http://localhost:8000/api/v1/agents/create?name=memcore" \
  -H "Authorization: Bearer $TOKEN"
```

That last call returns something like:

```json
{ "agentId": "...", "agentEmail": "memcore@cognee.agent", "agentApiKey": "ck_..." }
```

Copy `agentApiKey` — that's what MemCore uses from now on.

> `jq` is just for convenience in the curl one-liner above. No `jq`? Copy the
> `access_token` out of the login response by hand instead.

### Step 3 — Test it works, before touching Next.js at all

This step matters: confirm Cognee itself is working with a couple of plain
curl calls first, so if something's wrong you know it's Cognee/your LLM key,
not MemCore's code.

```bash
AGENT_KEY="ck_...the key from step 2..."

# Ingest a test memory (also builds the graph — /remember does both in one call)
curl -X POST http://localhost:8000/api/v1/remember \
  -H "Authorization: Bearer $AGENT_KEY" \
  -F "data=@-;filename=test.txt;type=text/plain" \
  -F "datasetName=memcore" \
  -F "run_in_background=false" <<< "We migrated to PostgreSQL for better write concurrency."

# Ask a question about it
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AGENT_KEY" \
  -d '{"search_type": "GRAPH_COMPLETION", "query": "Why did we migrate to Postgres?", "datasets": ["memcore"], "top_k": 5}'
```

If that second call returns a real, on-topic answer, Cognee is fully working
and the rest is just plumbing.

### Step 4 — Point MemCore at it

In `.env.local`:

```
MEMCORE_USE_MOCK=false
COGNEE_SERVICE_URL=http://localhost:8000
COGNEE_API_KEY=ck_...the key from step 2...
COGNEE_DATASET_NAME=memcore
```

Restart `npm run dev`. Every API route now flows through `LiveCogneeClient`
in `services/cognee/client.ts`.

### What to expect once it's live

Cognee builds its graph by running an LLM over whatever text you feed it —
it has no built-in idea of "meeting", "decision", "pull request", etc. Out of
the box, live nodes will be **raw extracted entities** (people, concepts,
organizations), not the tidy demo story MemCore ships with in mock mode.
**That's expected, not a bug.** If you want live data to carry MemCore's own
node types, pass a custom `graph_model` (a Pydantic schema matching
`MemoryNode`) to Cognee's `cognify` step — see Cognee's "Custom Graph
Models" docs. Until then, `LiveCogneeClient` falls back to sensible defaults
(type `"document"`, ingestion time as the timestamp).

### If something goes wrong

- **401/403 from Cognee** → your `COGNEE_API_KEY` is wrong, expired, or you
  copy-pasted the short-lived login `TOKEN` instead of the permanent
  `agentApiKey`. Re-run step 2.
- **Cognee itself returns odd/empty answers** → almost always the LLM key
  (`LLM_API_KEY` in *Cognee's* `.env`, not MemCore's), an unfunded/invalid
  OpenAI key, or you queried before `/remember` finished processing. Re-run
  the Step 3 curl calls in isolation to confirm.
- **Field names not matching (e.g. `search_type` vs `searchType`)** → Cognee's
  REST field naming has shifted across versions; open
  `http://localhost:8000/docs` on *your* running instance and check the
  live schema for `/api/v1/search` before assuming this README is
  byte-for-byte current.
- **Getting a REST 404 or 422** → check `docs.cognee.ai` for your installed
  Cognee version; endpoint paths and required fields do change between
  releases.

`services/cognee/client.ts` is the **only** file that knows whether MemCore
is on mock or live data, and it's marked `server-only` so it can never be
imported into a Client Component by accident.

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

- **Server Components by default.** Only pages/components that need
  interactivity (search input, graph drag/zoom, toggles, forms, session)
  are marked `"use client"`.
- **Business logic stays out of UI components.** Pages compose feature
  components; feature components call `fetch()` against API routes; API
  routes call `memoryClient`.
- **TypeScript strict mode** is on across the project.

## Knowledge Graph

`/workspace/graph` runs a real force simulation (`d3-force`: link, charge,
center, and collide forces) rather than a fixed layout — nodes settle into
place, you can drag any node to reposition it (physics reacts), scroll to
zoom, and drag the canvas to pan. Hovering a node highlights everything it's
connected to and dims the rest.

## Design system

Dark, calm, editorial — closer to Linear/Arc/Apple than an admin dashboard.

- **Palette:** ink `#09090B`, surface `#111318`, card `#171A21`, line
  `#23262F`, emerald accent `#34D399`, cyan secondary `#7DD3FC`, violet
  accent `#A78BFA`, warm white text `#F5F3EC`.
- **Type:** Fraunces (display/editorial serif, used sparingly for headlines),
  Inter (body/UI), JetBrains Mono (data, code, timestamps where needed).
- **Landing page:** fixed navbar with scroll blur, an orbital knowledge-graph
  hero visual (rotating rings, pulsing core, floating node chips), magnetic
  buttons, cursor-tilt cards, and scroll-triggered section reveals.

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion ·
d3-force · Lucide React · NextAuth.js · Cognee (own official REST server,
called directly — no custom backend) · deployed to Vercel.
