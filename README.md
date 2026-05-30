# Prompt Builder

**An AI prompt engineering studio with a modular component vault, semantic search, community packs, and multi-step prompt chaining.**

[Live Demo](https://promptbuilder-five.vercel.app) · [Portfolio](https://adrin-t-paul.vercel.app)

---

## Screenshots

### Standard Workbench
*No authentication required. Build, compile, and test prompts instantly.*

<img width="1139" height="907" alt="Standard Workbench" src="https://github.com/user-attachments/assets/58fbd63c-042e-4434-b108-eb2f2b3e5385" />

---

### Advanced Studio
*Google OAuth protected workspace with component vaults, semantic search, prompt packs, and chaining.*

<img width="1891" height="905" alt="Advanced Studio" src="https://github.com/user-attachments/assets/2ad72d9b-b2fa-4a0e-9ce7-fe9b43baf469" />

---

### Component Selector
*Browse and compose prompts using reusable Persona, Protocol, Format, and Template components.*

<img width="508" height="714" alt="Component Selector" src="https://github.com/user-attachments/assets/a83f1b02-3e4c-4e17-b867-dd609a02e1be" />

---

### Compiled Prompt Output
*View the final assembled prompt before execution, with full visibility into generated context.*

<img width="1908" height="903" alt="Compiled Prompt" src="https://github.com/user-attachments/assets/4118c46d-3a61-4d33-9bc5-cb42b6e35192" />
---

### Live SandBox
*Add your API Key and initiate chat through it.*

<img width="1638" height="814" alt="image" src="https://github.com/user-attachments/assets/04ea037e-021e-4e06-a36e-13dc45edf555" />
---

### Step Chaining
*You can chain multiple steps using different Prompts.*

<img width="1883" height="901" alt="image" src="https://github.com/user-attachments/assets/2e0dfc04-123b-484d-b17e-a682fdb54ca0" />


---
## The Problem

Most developers prompt AI models in one unstructured shot. The model has to infer intent, guess output format, and handle everything in a single bloated context window.

**Measured result:** A resume rewrite task in a single prompt consumed 41,000 tokens. The same task broken into three focused, structured prompts consumed 18,000 tokens — a **56% reduction** — with more precise output.

Prompt Builder is built around that insight. It gives you a structured, reusable, composable system for building prompts — not a blank text box.



---

## What It Does

Prompt Builder has two tiers:

### Standard Workbench (`/`)

A stateless prompt compiler. No auth required.

- 5 workflow templates — Summarise, Extract, Classify, Draft, Analyse
- PDF to Markdown parser — client-side via pdfjs-dist
- Live token counter — raw content vs compiled prompt size
- Live Sandbox — run against Gemini, GPT-4o Mini, or Claude Haiku with your own API key
- Real token telemetry from API response headers
- Prompt history via IndexedDB

### Advanced Studio (`/advanced`)

A full prompt engineering environment with auth, a component vault, semantic search, and chaining.

---

## Advanced Studio — Core Features

### Modular Component Vault

Prompts are built from composable primitives stored in a PostgreSQL database:

| Layer        | Purpose                                                         |
| ------------ | --------------------------------------------------------------- |
| **Persona**  | Defines who the model is — role, expertise, communication style |
| **Protocol** | Defines how it thinks — reasoning steps, constraints, rules     |
| **Format**   | Defines output structure — markdown, tables, JSON, reports      |
| **Template** | The task itself — with `{{variable}}` placeholders              |

39 public vault components across all layers, ready to use out of the box.

### Semantic Search

Type in the Task Template area and the studio automatically suggests relevant components from the vault using cosine similarity search powered by pgvector and Gemini embeddings (768-dimensional). Results update with a 1500ms debounce and show similarity scores.

### Community Hub (`/community`)

Discover and share **Prompt Packs** — curated bundles of components that represent a complete workflow preset (e.g. Code Review, Documentation Writer, Bug Analyser).

- Browse public packs with category filters and semantic search
- Load any pack directly into the studio with all components pre-selected
- Save packs to your personal library
- Create your own packs from the studio or community page
- Use count tracking per pack

### Prompt Chaining (`CHAIN` tab)

Build multi-step prompt pipelines where each step's output feeds into the next via `{{previous_output}}`.

**Example — Bug Report chain:**

1. Step 1: Analyse the bug description → structured root cause analysis
2. Step 2: `Based on: {{previous_output}}` → write a concrete fix
3. Step 3: `Review this fix: {{previous_output}}` → edge cases and approval verdict

Each step streams output in real time. Progress bar tracks completion. Chains are saved locally and reloadable.

### Live Sandbox

Run compiled prompts directly in the studio against three models — Gemini, GPT-4o Mini, Claude Haiku. Supports follow-up messages, conversation threading, and resumable chat sessions. Real token metrics per response.

---

## Architecture

```
Browser (Next.js App Router)
    │
    ├── /api/execute          ← BYOK streaming proxy (edge runtime)
    ├── /api/components       ← Vault CRUD + semantic search
    ├── /api/packs            ← Pack CRUD + save + use count
    │
    └── Supabase
          ├── prompt_components   (pgvector 768d, HNSW index, RLS)
          └── prompt_packs        (pgvector 768d, RLS)
              user_saved_packs
```

**API key security:** Keys are stored in `sessionStorage` only — never written to a database, never logged server-side. The Next.js edge route acts as a passthrough proxy. Keys are cleared when the tab closes.

**Auth:** Google OAuth via Supabase. Middleware protects `/advanced`, `/manage`, and `/community`. RLS policies enforce row-level ownership at the database layer, with a redundant ownership check in each API route.

---

## Tech Stack

| Layer         | Technology                               |
| ------------- | ---------------------------------------- |
| Frontend      | Next.js 15 (App Router), React           |
| Styling       | Tailwind CSS v4                          |
| Database      | Supabase (PostgreSQL + pgvector)         |
| Auth          | Supabase Google OAuth + @supabase/ssr    |
| Embeddings    | Gemini Embedding API (768d)              |
| Vector Search | pgvector — HNSW index, cosine similarity |
| AI Proxy      | Next.js Edge Route — Vercel AI SDK       |
| Providers     | Gemini, GPT-4o Mini, Claude Haiku        |
| Local Storage | localForage (IndexedDB)                  |
| Deployment    | Vercel                                   |

---

## Running Locally

```bash
git clone https://github.com/themechbro/promptbuilder
cd promptbuilder
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_GA_ID=your_ga4_id
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The Standard Workbench works without any environment variables. The Advanced Studio requires Supabase credentials and a Gemini API key for embedding generation.

---

## Vault Schema

```sql
create table prompt_components (
  id uuid primary key default gen_random_uuid(),
  type component_type not null,  -- persona | protocol | format | template | taxonomy
  name text not null,
  slug text not null,
  version text not null default '1.0.0',
  content text not null,
  metadata jsonb default '{}',
  embedding vector(768),          -- Gemini embedding for semantic search
  is_public boolean default false,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (created_by, type, slug)
);
```

HNSW index (`m=16, ef_construction=64`) for sub-millisecond approximate nearest neighbour search. Row-level security on all operations.

---

## Versions

| Version | Description                                                    |
| ------- | -------------------------------------------------------------- |
| v1.2.4  | Standard workbench — stateless, no auth                        |
| v2.0.0  | Advanced Studio — modular vault, Google OAuth, 4-layer canvas  |
| v2.1.0  | Live Sandbox — streaming, conversation threading, chat history |
| v2.2.0  | Semantic search — pgvector + Gemini embeddings, suggestion UI  |
| v2.3.0  | Community Hub — Prompt Packs, vault management                 |
| v2.3.1  | UI polish — Architecture Layers, modals, output tab            |
| v2.4.0  | Prompt Chaining — linear pipeline, streaming per step          |

---

## Open Source Contributions

- **grpc/grpc-java** — race condition fix in client connection handling ([merged](https://github.com/grpc/grpc-java))
- **Microsoft PromptKit** — active contributor
