# PromptBuilder

Build structured prompts in seconds. No blank page. No guessing.

A stateless frontend tool that converts natural language tasks into structured, role-enforced prompts — then lets you run them live against Gemini, GPT, or Claude using your own API key.

---

## The Problem It Solves

Most people prompt AI in one unstructured shot:

> "Please optimize my resume for this job description."

This works, but it's inefficient. The model has to infer your intent, guess the output format, and process everything in one bloated context window.

**Tested result:** A single-shot resume rewrite against a job description consumed **41,000 tokens**.

The same task broken into three focused, structured prompts consumed **18,000 tokens** — a **56% reduction** — while producing more precise, actionable output.

This tool is built around that insight.

---

## How It Works

**Step 1 — Select a workflow**

Pick from five task categories: Summarize, Extract Data, Classify, Draft, or Analyze.

**Step 2 — Fill the form**

Each workflow surfaces only the fields relevant to that task. No freeform guessing. Drop a PDF and it auto-converts to Markdown before injection.

**Step 3 — Get your structured prompt**

The tool compiles your inputs into a structured prompt with a defined system role, objective, and output constraints. See the token count before you send anything.

**Step 4 — Run it (optional)**

Switch to Live Sandbox, add your API key, and execute directly against Gemini, GPT-4o Mini, or Claude. Real token usage pulled from the API response — not estimated.

---

## Key Features

- **5 workflow templates** — Summarize, Extract Data, Classify, Draft, Analyze
- **PDF to Markdown parser** — client-side via pdfjs-dist, reduces token overhead before prompt injection
- **Live token counter** — tracks raw content size vs compiled prompt size in real time
- **Live Sandbox** — runs prompts against Gemini 2.0 Flash, GPT-4o Mini, or Claude Haiku using your own API key
- **Multi-model comparison** — run the same prompt across all three models simultaneously and compare output and token cost
- **Telemetry matrix** — exact input/output token counts from official API response headers
- **Prompt history** — last 10 generated prompts cached in localStorage
- **Export** — download any generated prompt as a `.txt` file
- **$0 running cost** — completely stateless, no database, no stored keys

---

## 📖 Interactive Operational Pipeline Walkthrough

Follow this 4-stage sequential workflow to unlock the maximum technical efficiency of the workbench:

### Phase 1: Context Aggregation & Schema Synthesis
1. Select your target engineering microservice from the workflow selector grid (e.g., **Extract Data** or **Analyze**).
2. Input your custom parameter variables inside the reactive form fields, or drop an architectural schema PDF into the edge pipeline processing node to instantly parse text content variables.
3. Observe real-time state synchronization updating your variables on the reactive template canvas.

### Phase 2: Accelerated Core Compilation & Export
1. With your form fields set, hit the power-user shortcut **`Ctrl + Enter`** (or **`Cmd + Enter`** on macOS).
2. The compilation engine instantly resolves delimiters (`[SYSTEM ROLE]`, `[OBJECTIVE]`), parses structural parameters, and injects the output directly onto your operating system clipboard.
3. Check the integrated telemetry indicator to track your compiled template length vs. raw resource content weights.

### Phase 3: Cross-Runtime Multi-Model Sandboxing
1. Toggle to the **⚡ Interactive Live Sandbox** view utilizing the master navigation grid header.
2. If this is your first session execution run, tap **⚙️ Manage API Keys** and securely load your upstream free-tier Gemini API token directly into isolation memory.
3. Focus your cursor on the canvas workspace and trigger **`Ctrl + Enter`** to send concurrent API proxy dispatches to evaluate raw execution variations.

### Phase 4: Downstream Step Chaining Pipeline Handoff
1. Leave the sandbox view and switch to a consecutive workflow context (e.g., changing category layouts from *Extract Data* to *Analyze*).
2. Because a successful run payload is securely resting in the parent data buffer, a pulsing token labeled **`🔗 Link Upstream Output Data`** will automatically wake up.
3. Click the link token to instantly populate the active form text container with your previous output matrix, completely eliminating manual copy-paste overhead.

---

## Architecture

Direct API calls from the browser are blocked by CORS restrictions on all three providers. Instead of asking users to expose their keys to a third-party backend, this tool uses a minimal Next.js serverless route as a passthrough proxy:

```
Client (React)  →  Next.js API Route  →  LLM Provider
                ←  (Stateless Proxy)  ←
```

The API key lives in React state only — never written to localStorage, never logged server-side, gone when the tab closes.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React |
| Styling | Tailwind CSS |
| Token Counting | gpt-tokenizer (client-side) |
| PDF Parsing | pdfjs-dist (client-side) |
| API Proxy | Next.js Serverless Route |
| Providers | Gemini 2.0 Flash, GPT-4o Mini, Claude Haiku |
| Deployment | Vercel |

---

## Workflow Example — Resume vs Job Description

This is the use case that produced the 56% token reduction figure.

**Naive approach (41K tokens):**
> Paste resume + job description → "Rewrite my resume for this role"

**Structured approach (18K tokens):**

1. **Extract Data** — paste the job description, extract core technical skills, required databases, architectural patterns as a Markdown table
2. **Analyze** — paste your resume + the keyword table, run a Gap Analysis to find missing alignment
3. **Draft** — rewrite only the experience bullets that need updating, using Action-Context-Result framework with hard metrics

Same end result. 56% fewer tokens. More precise output because each step has a single, clear job.

---

## Security

- API keys are stored in React component state only
- Keys are never written to localStorage, sessionStorage, or any database
- The serverless proxy does not log request payloads or keys
- Keys are cleared automatically when the session ends

---

## Running Locally

```bash
git clone https://github.com/your-username/prompt-template-builder
cd prompt-template-builder
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No `.env` setup required for core functionality. API keys are entered at runtime by the user.