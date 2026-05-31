"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  Zap,
  Cpu,
  Library,
  Link2,
  Terminal,
  Key,
  ChevronRight,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";

// ─── Section data ────────────────────────────────────────────────────────────
const sections = [
  { id: "getting-started", label: "Getting Started", icon: BookOpen },
  { id: "standard-studio", label: "Standard Studio", icon: Zap },
  { id: "advanced-studio", label: "Advanced Studio", icon: Cpu },
  { id: "component-vault", label: "Component Vault", icon: Library },
  { id: "prompt-chaining", label: "Prompt Chaining", icon: Link2 },
  { id: "mcp-server", label: "MCP Server", icon: Terminal },
  { id: "api-keys", label: "API Keys", icon: Key },
];

// ─── Code block with copy ─────────────────────────────────────────────────────
function CodeBlock({ code, lang = "" }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900/80">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-800/60">
        <span className="text-[11px] font-mono text-slate-500">{lang}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
        >
          {copied ? (
            <Check size={12} className="text-emerald-400" />
          ) : (
            <Copy size={12} />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-[13px] font-mono text-slate-300 overflow-x-auto leading-relaxed whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

// ─── Step pill ────────────────────────────────────────────────────────────────
function Step({ n, children }) {
  return (
    <div className="flex gap-4 items-start py-3">
      <div className="shrink-0 w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-xs font-bold text-indigo-400 font-mono mt-0.5">
        {n}
      </div>
      <div className="text-sm text-slate-300 leading-relaxed pt-0.5">
        {children}
      </div>
    </div>
  );
}

// ─── Callout ──────────────────────────────────────────────────────────────────
function Callout({ type = "info", children }) {
  const styles = {
    info: "bg-indigo-500/8  border-indigo-500/25 text-indigo-300",
    tip: "bg-emerald-500/8 border-emerald-500/25 text-emerald-300",
    warning: "bg-amber-500/8   border-amber-500/25   text-amber-300",
  };
  const labels = { info: "Note", tip: "Tip", warning: "Warning" };
  return (
    <div
      className={`my-4 rounded-xl border px-4 py-3 text-sm leading-relaxed ${styles[type]}`}
    >
      <span className="font-semibold mr-2">{labels[type]}:</span>
      {children}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ children, color = "indigo" }) {
  const c = {
    indigo: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
    amber: "bg-amber-500/15  text-amber-400  border-amber-500/25",
    teal: "bg-teal-500/15   text-teal-400   border-teal-500/25",
    slate: "bg-slate-700/50  text-slate-400  border-slate-600/40",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-medium border ${c[color]}`}
    >
      {children}
    </span>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-9 h-9 rounded-xl bg-indigo-500/12 border border-indigo-500/20 flex items-center justify-center">
        <Icon size={17} className="text-indigo-400" />
      </div>
      <h2 className="text-xl font-bold text-white tracking-tight">{label}</h2>
    </div>
  );
}

function H3({ children }) {
  return (
    <h3 className="text-base font-semibold text-slate-100 mt-7 mb-3">
      {children}
    </h3>
  );
}

function P({ children }) {
  return (
    <p className="text-sm text-slate-400 leading-relaxed mb-3">{children}</p>
  );
}

function UL({ items }) {
  return (
    <ul className="space-y-2 my-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
          <ChevronRight
            size={14}
            className="text-indigo-500/60 mt-0.5 shrink-0"
          />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ─── Content sections ─────────────────────────────────────────────────────────
function GettingStarted() {
  return (
    <div>
      <SectionHeading icon={BookOpen} label="Getting Started" />
      <P>
        Prompt Builder is a component-based prompt IDE. Instead of writing
        prompts from scratch every time, you assemble them from reusable
        building blocks — personas, protocols, formats, and templates — from a
        shared public vault.
      </P>
      <P>
        There are two ways to use it:{" "}
        <strong className="text-slate-200">Standard Studio</strong> for quick,
        no-login prompt runs, and{" "}
        <strong className="text-slate-200">Advanced Studio</strong> for the full
        component workflow with saved vaults, chaining, and MCP integration.
      </P>

      <H3>Who is this for?</H3>
      <UL
        items={[
          "Developers building LLM-powered applications who need repeatable, structured prompts",
          "Teams that want a shared library of prompt components instead of scattered notes",
          "Anyone using Claude Desktop or Cursor who wants their vault accessible as MCP tools",
          "Prompt engineers who want to test, chain, and iterate without switching tools",
        ]}
      />

      <H3>Quick start</H3>
      <Step n={1}>
        Go to{" "}
        <Link
          href="/standard"
          className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
        >
          /standard
        </Link>{" "}
        — no login needed. Pick a provider, paste your API key (stays in your
        browser), write a prompt, and run it.
      </Step>
      <Step n={2}>
        Sign up via{" "}
        <Link
          href="/auth/login"
          className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
        >
          /auth/login
        </Link>{" "}
        to unlock Advanced Studio, the component vault, and packs.
      </Step>
      <Step n={3}>
        In{" "}
        <Link
          href="/advanced"
          className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
        >
          /advanced
        </Link>
        , browse the vault, select components, compile your prompt, and execute.
      </Step>
      <Step n={4}>
        Optionally, generate an API key in Settings and connect the MCP server
        to Claude Desktop or Cursor.
      </Step>

      <Callout type="tip">
        Your API keys for LLM providers (OpenAI, Anthropic, Gemini) are never
        sent to our servers. They live only in your browser session.
      </Callout>
    </div>
  );
}

function StandardStudio() {
  return (
    <div>
      <SectionHeading icon={Zap} label="Standard Studio" />
      <P>
        Standard Studio is a lightweight, stateless prompt runner. No account
        required. It is the fastest way to test a prompt against a model without
        any setup.
      </P>

      <H3>What you can do</H3>
      <UL
        items={[
          "Write and run prompts against OpenAI, Anthropic, and Gemini models",
          "Switch providers and models without leaving the page",
          "See token usage and response time for each run",
          "Multi-turn conversation with persistent message history within the session",
          "Clear session and start fresh at any point",
        ]}
      />

      <H3>How to use it</H3>
      <Step n={1}>
        Navigate to{" "}
        <Link
          href="/standard"
          className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
        >
          /standard
        </Link>
        .
      </Step>
      <Step n={2}>
        Select your provider from the dropdown (OpenAI, Anthropic, Gemini).
      </Step>
      <Step n={3}>
        Paste your provider API key into the key field. It is stored in-memory
        only — never transmitted to our servers.
      </Step>
      <Step n={4}>Select the model you want to run against.</Step>
      <Step n={5}>
        Type your prompt and hit Run. Responses stream in real time.
      </Step>

      <Callout type="info">
        Session state (conversation history, API keys) is cleared on page
        refresh. This is intentional — Standard Studio is stateless by design.
      </Callout>

      <H3>Limitations</H3>
      <UL
        items={[
          "No component vault access — that requires Advanced Studio",
          "No prompt saving or history — session only",
          "No prompt chaining",
        ]}
      />
    </div>
  );
}

function AdvancedStudio() {
  return (
    <div>
      <SectionHeading icon={Cpu} label="Advanced Studio" />
      <P>
        Advanced Studio is the full Prompt Builder experience. It requires a
        free account and gives you access to the component vault, packs, prompt
        chaining, execution history, and MCP integration.
      </P>

      <H3>The workspace layout</H3>
      <UL
        items={[
          "Left panel — component selector, vault browser, and pack selector",
          "Centre panel — the compiled prompt editor where you write and assemble",
          "Right panel — execution output, token metrics, and response history",
        ]}
      />

      <H3>Basic workflow</H3>
      <Step n={1}>
        Log in and go to{" "}
        <Link
          href="/advanced"
          className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
        >
          /advanced
        </Link>
        .
      </Step>
      <Step n={2}>
        Click <Badge>Add Component</Badge> to open the vault. Pick a persona,
        protocol, format, or template.
      </Step>
      <Step n={3}>
        Selected components are injected into the prompt editor automatically.
        You can reorder or edit the compiled output.
      </Step>
      <Step n={4}>
        Add your task or context in the user input field below the compiled
        prompt.
      </Step>
      <Step n={5}>
        Select your provider, paste your API key, choose the model, and hit{" "}
        <Badge color="teal">Execute</Badge>.
      </Step>
      <Step n={6}>
        Response streams into the right panel. Token count and response time are
        shown on completion.
      </Step>

      <Callout type="tip">
        Use a Pack to load an entire set of pre-matched components in one click
        instead of adding them one by one.
      </Callout>

      <H3>Execution providers</H3>
      <P>
        Advanced Studio supports the same three providers as Standard — OpenAI,
        Anthropic, and Gemini — with the same in-browser key policy.
      </P>
    </div>
  );
}

function ComponentVault() {
  return (
    <div>
      <SectionHeading icon={Library} label="Component Vault" />
      <P>
        The vault is a shared library of prompt building blocks. Every component
        is public and usable by all logged-in users. You can also create your
        own private components.
      </P>

      <H3>Component types</H3>
      <div className="grid grid-cols-2 gap-3 my-4">
        {[
          {
            type: "Persona",
            color: "indigo",
            desc: "Defines who the model should act as. Sets tone, expertise, and communication style.",
          },
          {
            type: "Protocol",
            color: "amber",
            desc: "A set of rules or steps the model must follow when completing a task.",
          },
          {
            type: "Format",
            color: "teal",
            desc: "Defines how the output should be structured — headers, lists, JSON, etc.",
          },
          {
            type: "Template",
            color: "slate",
            desc: "A complete, ready-to-run prompt combining persona, protocol, and format for a specific task.",
          },
        ].map(({ type, color, desc }) => (
          <div
            key={type}
            className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40"
          >
            <Badge color={color}>{type}</Badge>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {desc}
            </p>
          </div>
        ))}
      </div>

      <H3>Browsing and searching</H3>
      <UL
        items={[
          "Filter by type — Persona, Protocol, Format, Template",
          "Semantic search — type a concept and it finds relevant components even without keyword matches (powered by pgvector + Gemini embeddings)",
          "Preview any component before adding it via the Eye icon",
        ]}
      />

      <H3>Creating a custom component</H3>
      <Step n={1}>
        Click <Badge>Create Component</Badge> in the vault panel.
      </Step>
      <Step n={2}>Choose a type, give it a name, write the content.</Step>
      <Step n={3}>
        Save. It appears in your vault immediately and is available in search.
      </Step>

      <Callout type="info">
        Public vault components are curated and seeded by the Prompt Builder
        team. Your custom components are private to your account.
      </Callout>

      <H3>Packs</H3>
      <P>
        Packs are curated sets of components for a specific task or domain — for
        example, the
        <strong className="text-slate-200">
          {" "}
          Structured Interview Kit
        </strong>{" "}
        pack includes a Talent Acquisition persona, Structured Hiring protocol,
        Interview Kit format, and a matching template. Load a pack in one click
        instead of assembling components manually.
      </P>
      <P>
        You can also save your own component combinations as a pack for reuse.
      </P>
    </div>
  );
}

function PromptChaining() {
  return (
    <div>
      <SectionHeading icon={Link2} label="Prompt Chaining" />
      <P>
        Prompt chaining lets you build multi-step workflows where the output of
        one prompt automatically becomes the input of the next. Each step runs
        sequentially and passes its result forward.
      </P>

      <H3>How it works</H3>
      <P>
        In any prompt step after the first, use the placeholder{" "}
        <code className="text-amber-400 bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">
          {"{{previous_output}}"}
        </code>{" "}
        anywhere in your prompt text. When the chain runs, Prompt Builder
        replaces that placeholder with the actual output from the step before
        it.
      </P>

      <H3>Example</H3>
      <CodeBlock
        lang="Step 1 — Research"
        code={`Summarise the key arguments in favour of remote-first engineering teams.`}
      />
      <CodeBlock
        lang="Step 2 — Transform"
        code={`Take the following summary and turn it into a structured blog post outline with 5 sections:

{{previous_output}}`}
      />
      <CodeBlock
        lang="Step 3 — Write"
        code={`Write the full blog post based on this outline. Use a confident, direct tone aimed at engineering managers:

{{previous_output}}`}
      />

      <H3>Building a chain in the UI</H3>
      <Step n={1}>
        In Advanced Studio, click <Badge>Add Step</Badge> to add a new chain
        step below the current prompt.
      </Step>
      <Step n={2}>
        Write the step prompt. Insert{" "}
        <code className="text-amber-400 bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">
          {"{{previous_output}}"}
        </code>{" "}
        wherever you want the previous result injected.
      </Step>
      <Step n={3}>Repeat for as many steps as you need.</Step>
      <Step n={4}>
        Hit <Badge color="teal">Run Chain</Badge>. Steps execute one by one and
        results are shown per step.
      </Step>

      <Callout type="warning">
        Each step in a chain is a separate API call. Long chains consume more
        tokens. Check your provider's rate limits if you are running large
        chains frequently.
      </Callout>

      <H3>Tips</H3>
      <UL
        items={[
          "Keep each step focused on one transformation — research, structure, write, review",
          "You can mix providers across steps — use Gemini for research, GPT-4 for writing",
          "Components apply per-step — each step can have its own persona and protocol",
        ]}
      />
    </div>
  );
}

function McpServer() {
  return (
    <div>
      <SectionHeading icon={Terminal} label="MCP Server" />
      <P>
        The Prompt Builder MCP server exposes your component vault as native
        tools inside Claude Desktop, Cursor, or any MCP-compatible client.
        Instead of copying components manually, you call them directly from the
        AI.
      </P>

      <H3>Prerequisites</H3>
      <UL
        items={[
          "Node.js 18 or higher",
          "A Prompt Builder account with a generated API key (see API Keys section)",
          "Claude Desktop or Cursor installed",
        ]}
      />

      <H3>Installation</H3>
      <P>No global install needed. Use npx to run it directly:</P>
      <CodeBlock
        lang="terminal"
        code={`npx -y promptbuilder-mcp --key YOUR_API_KEY`}
      />

      <H3>Claude Desktop config</H3>
      <P>
        Add this to your{" "}
        <code className="text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">
          claude_desktop_config.json
        </code>
        :
      </P>
      <CodeBlock
        lang="claude_desktop_config.json"
        code={`{
  "mcpServers": {
    "promptbuilder": {
      "command": "npx",
      "args": [
        "-y",
        "promptbuilder-mcp",
        "--key",
        "YOUR_API_KEY"
      ]
    }
  }
}`}
      />
      <P>
        The config file is typically at{" "}
        <code className="text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">
          ~/Library/Application Support/Claude/claude_desktop_config.json
        </code>{" "}
        on macOS, or{" "}
        <code className="text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">
          %APPDATA%\Claude\claude_desktop_config.json
        </code>{" "}
        on Windows.
      </P>

      <H3>Cursor config</H3>
      <CodeBlock
        lang="~/.cursor/mcp.json"
        code={`{
  "mcpServers": {
    "promptbuilder": {
      "command": "npx",
      "args": ["-y", "promptbuilder-mcp", "--key", "YOUR_API_KEY"]
    }
  }
}`}
      />

      <H3>Available tools</H3>
      <div className="space-y-2 my-4">
        {[
          {
            name: "list_components",
            desc: "List components by type with an optional name search",
          },
          {
            name: "get_component",
            desc: "Fetch the full content of a component by ID",
          },
          {
            name: "search_components",
            desc: "Search components by name and type",
          },
          {
            name: "list_packs",
            desc: "List packs by category with an optional name search",
          },
          {
            name: "get_pack",
            desc: "Fetch a complete pack with all component content resolved in one call",
          },
        ].map(({ name, desc }) => (
          <div
            key={name}
            className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/40"
          >
            <code className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded shrink-0 mt-0.5">
              {name}
            </code>
            <span className="text-sm text-slate-400">{desc}</span>
          </div>
        ))}
      </div>

      <Callout type="tip">
        Use{" "}
        <code className="text-emerald-400 bg-slate-800 px-1 py-0.5 rounded text-xs font-mono">
          get_pack
        </code>{" "}
        instead of fetching components one by one — it resolves all component
        content in a single call.
      </Callout>
    </div>
  );
}

function ApiKeys() {
  return (
    <div>
      <SectionHeading icon={Key} label="API Keys" />
      <P>
        Prompt Builder API keys are separate from your LLM provider keys. They
        authenticate the MCP server against your vault. A key gives read access
        to your components and packs.
      </P>

      <Callout type="warning">
        The raw key is shown only once on creation and never stored. Copy it
        immediately and keep it somewhere safe.
      </Callout>

      <H3>Generating a key</H3>
      <Step n={1}>
        Go to{" "}
        <Link
          href="/settings"
          className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
        >
          /settings
        </Link>
        .
      </Step>
      <Step n={2}>
        Under <strong className="text-slate-200">API Keys</strong>, click{" "}
        <Badge>Generate Key</Badge>.
      </Step>
      <Step n={3}>Give it a name (e.g. "Claude Desktop", "Cursor").</Step>
      <Step n={4}>Copy the key immediately — it will not be shown again.</Step>

      <H3>Key format</H3>
      <CodeBlock lang="example" code={`pb_a3f9c2e1d84b76a509f12e3c8d71b0a4`} />
      <P>
        Keys are prefixed with{" "}
        <code className="text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">
          pb_
        </code>{" "}
        followed by 32 hex characters. The raw key is never stored — only a
        SHA-256 hash is kept in the database.
      </P>

      <H3>Scopes</H3>
      <UL
        items={[
          "components:read — list, search, and fetch components",
          "packs:read — list and fetch packs with resolved components",
        ]}
      />
      <P>
        Write scopes are not available via API key. Creating or editing
        components requires a logged-in session.
      </P>

      <H3>Managing keys</H3>
      <UL
        items={[
          "You can have up to 10 active keys per account",
          "Each key shows its name, prefix, creation date, and last used time",
          "Revoke any key at any time from the Settings page — it takes effect immediately",
        ]}
      />

      <H3>Rate limits</H3>
      <div className="my-4 rounded-xl overflow-hidden border border-slate-700/50">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="bg-slate-800/60 text-slate-400">
              <th className="text-left px-4 py-2.5 font-medium">Endpoint</th>
              <th className="text-left px-4 py-2.5 font-medium">Limit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/40">
            {[
              ["GET /api/mcp/components", "30 req / 60s"],
              ["GET /api/mcp/components/[id]", "60 req / 60s"],
              ["GET /api/mcp/packs", "30 req / 60s"],
              ["GET /api/mcp/packs/[id]", "60 req / 60s"],
              ["GET /api/keys", "20 req / 60s"],
              ["POST /api/keys", "5 req / 60s"],
              ["DELETE /api/keys/[id]", "10 req / 60s"],
            ].map(([ep, limit], i) => (
              <tr
                key={i}
                className="bg-slate-900/40 hover:bg-slate-800/30 transition-colors"
              >
                <td className="px-4 py-2.5 text-slate-300">{ep}</td>
                <td className="px-4 py-2.5 text-amber-400">{limit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const sectionComponents = {
  "getting-started": GettingStarted,
  "standard-studio": StandardStudio,
  "advanced-studio": AdvancedStudio,
  "component-vault": ComponentVault,
  "prompt-chaining": PromptChaining,
  "mcp-server": McpServer,
  "api-keys": ApiKeys,
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DocsPage() {
  const [active, setActive] = useState("getting-started");
  const contentRef = useRef(null);

  const ActiveSection = sectionComponents[active];

  const navigate = (id) => {
    setActive(id);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  };

  return (
    <div className="min-h-screen bg-[#0b1020] text-slate-100">
      {/* top bar */}
      <div className="border-b border-slate-800/60 bg-slate-950/60 backdrop-blur-xl px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          <span className="text-slate-300">Documentation</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex min-h-[calc(100vh-112px)]">
        {/* ── Sidebar ── */}
        <aside className="w-60 shrink-0 sticky top-[112px] self-start border-r border-slate-800/50 py-8 pr-4 pl-6">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-4 px-2">
            Contents
          </p>
          <nav className="space-y-0.5">
            {sections.map(({ id, label, icon: Icon }) => {
              const isActive = active === id;
              return (
                <button
                  key={id}
                  onClick={() => navigate(id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                    isActive
                      ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                      : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/40"
                  }`}
                >
                  <Icon
                    size={14}
                    className={isActive ? "text-indigo-400" : "text-slate-600"}
                  />
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Quick links */}
          <div className="mt-8 pt-6 border-t border-slate-800/50">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-3 px-2">
              Quick links
            </p>
            <div className="space-y-0.5">
              {[
                { label: "Standard Studio", href: "/standard" },
                { label: "Advanced Studio", href: "/advanced" },
                { label: "Settings", href: "/settings" },
                {
                  label: "GitHub",
                  href: "https://github.com/themechbro/promptbuilder",
                  external: true,
                },
                {
                  label: "npm package",
                  href: "https://www.npmjs.com/package/promptbuilder-mcp",
                  external: true,
                },
              ].map(({ label, href, external }) => (
                <Link
                  key={label}
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition-all"
                >
                  <ArrowRight size={11} className="text-slate-600" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Content ── */}
        <main ref={contentRef} className="flex-1 px-10 py-10 max-w-3xl">
          <ActiveSection />

          {/* Prev / Next navigation */}
          <div className="flex items-center justify-between mt-12 pt-6 border-t border-slate-800/50">
            {(() => {
              const idx = sections.findIndex((s) => s.id === active);
              const prev = sections[idx - 1];
              const next = sections[idx + 1];
              return (
                <>
                  {prev ? (
                    <button
                      onClick={() => navigate(prev.id)}
                      className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-200 transition-colors"
                    >
                      <ChevronRight size={14} className="rotate-180" />
                      {prev.label}
                    </button>
                  ) : (
                    <div />
                  )}
                  {next ? (
                    <button
                      onClick={() => navigate(next.id)}
                      className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-200 transition-colors"
                    >
                      {next.label}
                      <ChevronRight size={14} />
                    </button>
                  ) : (
                    <Link
                      href="/advanced"
                      className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Open Studio <ArrowRight size={14} />
                    </Link>
                  )}
                </>
              );
            })()}
          </div>
        </main>
      </div>
    </div>
  );
}
