// "use client";

// import { useEffect } from "react";
// import Workspace from "./components/Workspace";
// import { KeyRound, ShieldCheck, Sparkles } from "lucide-react";

// export default function HomePage() {
//   useEffect(() => {
//     // 1. Initialize tracking timers on load
//     const startTime = Date.now();
//     const referrer = typeof document !== "undefined" ? document.referrer : "";

//     // 2. Classify client hardware infrastructure accurately
//     const parseDevice = () => {
//       if (typeof window === "undefined") return "Desktop";
//       const ua = window.navigator.userAgent;
//       if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua))
//         return "Tablet";
//       if (
//         /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(
//           ua,
//         )
//       )
//         return "Mobile";
//       return "Desktop";
//     };

//     const deviceType = parseDevice();

//     // 3. Dispatch data handler function
//     const sendAnalyticsPayload = () => {
//       const endTime = Date.now();
//       // Calculate total duration elapsed in clean seconds
//       const durationSeconds = Math.round((endTime - startTime) / 1000);

//       // Do not log negligible or instantaneous accidental page bounces (under 1 second)
//       if (durationSeconds < 1) return;

//       const payload = JSON.stringify({
//         device: deviceType,
//         referrer: referrer || "Direct",
//         duration: durationSeconds,
//       });

//       // Execute non-blocking beacon stream to avoid impacting main browser layout threads
//       fetch("/api/track", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: payload,
//         keepalive: true, // Crucial parameter to maintain payload continuity post-tab eviction
//       }).catch((err) =>
//         console.warn("Analytics telemetry transmission omitted:", err),
//       );
//     };

//     // 4. Register structural state lifecycle listeners
//     const handleVisibilityChange = () => {
//       if (document.visibilityState === "hidden") {
//         sendAnalyticsPayload();
//       }
//     };

//     document.addEventListener("visibilitychange", handleVisibilityChange);

//     // Fallback cleanup hook assignment
//     return () => {
//       document.removeEventListener("visibilitychange", handleVisibilityChange);
//     };
//   }, []);

//   return (
//     <main className="min-h-screen bg-[#0b1020] text-slate-100 antialiased selection:bg-cyan-400/20">
//       <header className="relative z-40 border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/30">
//         <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
//           {/* Title Section */}
//           <div className="flex items-center gap-4">
//             {/* Icon Wrapper with App-Theme Glow */}
//             <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
//               <Sparkles className="h-5 w-5" aria-hidden="true" />
//               {/* Ambient inner glow */}
//               <div className="absolute inset-0 rounded-xl bg-indigo-400/10 blur-md pointer-events-none" />
//             </div>

//             <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-100 leading-snug max-w-lg">
//               Build, test, and chain prompts without losing your place.
//             </h1>
//           </div>

//           {/* Status / Security Badges */}
//           <div className="flex flex-wrap items-center gap-3 mt-1 sm:mt-0">
//             {/* Local Session Tag (Semantic Success/Secure Color) */}
//             <div className="group flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20 cursor-default">
//               <ShieldCheck className="h-4 w-4" aria-hidden="true" />
//               <span>Local session</span>
//               {/* Live Ping Indicator */}
//               <span className="relative flex h-2 w-2 ml-0.5">
//                 <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
//                 <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
//               </span>
//             </div>

//             {/* Privacy Tag */}
//             <div className="flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-md transition-colors hover:bg-slate-800/80 cursor-default shadow-sm">
//               <KeyRound className="h-4 w-4 text-slate-400" aria-hidden="true" />
//               <span>Keys stay in browser</span>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
//         <Workspace />
//       </div>
//     </main>
//   );
// }

import Link from "next/link";
import "./landing.css";
import logo from "@/public/logo/icon.png";
import Image from "next/image";
import JsonLd from "./components/JsonLd";

export const metadata = {
  title: "Prompt Builder — Build Prompts That Actually Work",
  description:
    "A free, open-source component-based prompt IDE. Build reusable prompt components, chain multi-step workflows, and connect your vault to Claude Desktop via MCP.",
  alternates: {
    canonical: "https://promptbuilder-five.vercel.app/",
  },
  openGraph: {
    title: "Prompt Builder — Build Prompts That Actually Work",
    description:
      "Free prompt engineering IDE with vault, chaining, and MCP server support.",
    url: "https://promptbuilder-five.vercel.app/",
  },
};

const mcpConfigHtml = `<span style="color:#3A3A5A">{</span><br>
&nbsp;&nbsp;<span style="color:#9B8AFF">"mcpServers"</span><span style="color:#3A3A5A">: {</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#9B8AFF">"promptbuilder"</span><span style="color:#3A3A5A">: {</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#9B8AFF">"command"</span><span style="color:#3A3A5A">: </span><span style="color:#00C9A7">"npx"</span><span style="color:#3A3A5A">,</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#9B8AFF">"args"</span><span style="color:#3A3A5A">: [</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#00C9A7">"-y"</span><span style="color:#3A3A5A">,</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#00C9A7">"promptbuilder-mcp"</span><span style="color:#3A3A5A">,</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#00C9A7">"--key"</span><span style="color:#3A3A5A">,</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#00C9A7">"YOUR_API_KEY"</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#3A3A5A">]</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#3A3A5A">}</span><br>
&nbsp;&nbsp;<span style="color:#3A3A5A">}</span><br>
<span style="color:#3A3A5A">}</span><br><br>
<span style="color:#2A2A3C">// Generate your key at /settings</span>`;

export default function LandingPage() {
  return (
    <div style={{ overflowX: "hidden" }}>
      <JsonLd />
      <div className="grid-bg" />

      {/* ── Nav ── */}
      <nav className="land-nav">
        <Link href="/" className="logo">
          <Image src={logo} className="logo-mk" />
          <span className="logo-nm">promptbuilder</span>
        </Link>
        <div className="nav-ls">
          <Link href="/docs" className="nav-a">
            Docs
          </Link>
          <a
            href="https://github.com/themechbro/promptbuilder"
            className="nav-a"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/promptbuilder-mcp"
            className="nav-a"
            target="_blank"
            rel="noopener noreferrer"
          >
            npm
          </a>
          <Link href="/advanced" className="nav-btn">
            Open Studio →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="hero">
        <div className="hero-glow" />
        <div className="badge">
          <span className="bdot" />
          v2.5.0 · MCP Server Live
        </div>
        <h1>
          Build prompts
          <br />
          that <em>actually work.</em>
        </h1>
        <p className="hero-sub">
          A component-based prompt IDE with a public vault, semantic search,
          prompt chaining, and an MCP server that plugs directly into Claude
          Desktop and Cursor.
        </p>
        <div className="ha">
          <Link href="/advanced" className="bp">
            Open Studio{" "}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <a
            href="https://github.com/themechbro/promptbuilder"
            className="bs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
        <div className="stats-bar">
          <div className="st">
            <div className="sv">45</div>
            <div className="sl">Components</div>
          </div>
          <div className="st">
            <div className="sv">10</div>
            <div className="sl">Packs</div>
          </div>
          <div className="st">
            <div className="sv">5</div>
            <div className="sl">Domains</div>
          </div>
          <div className="st">
            <div className="sv">Free</div>
            <div className="sl">Always</div>
          </div>
        </div>
      </div>

      {/* ── Features ── */}
      <section className="sec">
        <div className="sl2">Features</div>
        <h2 className="st2">
          Everything a prompt needs.
          <br />
          Nothing it doesn&apos;t.
        </h2>
        <p className="ss">
          Stop re-inventing prompts. Build once, reuse everywhere.
        </p>
        <div className="fg">
          <div className="fc">
            <div className="fi fig">🗄️</div>
            <div className="ft">Component Vault</div>
            <p className="fd">
              45 public personas, protocols, formats, and templates across 5
              professional domains. Mix, match, compile.
            </p>
            <div className="fch chg">45 components</div>
          </div>
          <div className="fc">
            <div className="fi fit">🔌</div>
            <div className="ft">MCP Integration</div>
            <p className="fd">
              Install <code>promptbuilder-mcp</code> and your vault becomes
              native tools in Claude Desktop and Cursor. One-command setup.
            </p>
            <div className="fch cht">npx ready</div>
          </div>
          <div className="fc">
            <div className="fi fip">⛓️</div>
            <div className="ft">Prompt Chaining</div>
            <p className="fd">
              Chain prompts with <code>{"{{previous_output}}"}</code> injection.
              Build multi-step workflows that compound.
            </p>
            <div className="fch chp">v2.4.0+</div>
          </div>
        </div>
      </section>

      {/* ── MCP Section ── */}
      <div className="mcp-w">
        <div className="mcp-b">
          <div className="ml">
            <div className="mt2">MCP Server</div>
            <div className="mti">
              Your vault,
              <br />
              inside your IDE.
            </div>
            <p className="md">
              Connect once with your API key. Every component and pack becomes a
              callable tool — in Claude Desktop, Cursor, or any MCP client.
            </p>
            <div className="mcc">
              <span className="cc">Claude Desktop</span>
              <span className="cc">Cursor</span>
              <span className="cc">Any MCP client</span>
            </div>
          </div>
          <div className="mr">
            <div className="cw">
              <div className="cb2">
                <div className="ds">
                  <div className="dot dr" />
                  <div className="dot dy" />
                  <div className="dot dg" />
                </div>
                <div className="cf">claude_desktop_config.json</div>
                <div style={{ width: "55px" }} />
              </div>
              <div
                className="cy"
                dangerouslySetInnerHTML={{ __html: mcpConfigHtml }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── How it works ── */}
      <section className="sec">
        <div className="sl2">How it works</div>
        <h2 className="st2">Three steps to a better prompt.</h2>
        <p className="ss">
          Pick components, compile, execute. That&apos;s the whole workflow.
        </p>
        <div className="steps">
          <div className="stp">
            <div className="sn">1</div>
            <div className="stt">Pick Components</div>
            <p className="sd">
              Browse the vault or search semantically. Add a persona, protocol,
              format — whatever the task needs.
            </p>
          </div>
          <div className="stp">
            <div className="sn">2</div>
            <div className="stt">Compile &amp; Chain</div>
            <p className="sd">
              The compiler assembles components into a structured prompt. Chain
              steps with output injection.
            </p>
          </div>
          <div className="stp">
            <div className="sn">3</div>
            <div className="stt">Execute Anywhere</div>
            <p className="sd">
              Run in the Studio, or expose your vault as MCP tools in Claude
              Desktop and Cursor.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="cta-s">
        <div className="cta-g" />
        <h2 className="cta-h">
          Start building
          <br />
          better prompts.
        </h2>
        <p className="cta-p">
          Free, open source, and yours to use however you want.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <Link href="/advanced" className="bp">
            Open Studio →
          </Link>
          <a
            href="https://www.npmjs.com/package/promptbuilder-mcp"
            className="bs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M0 0v24h6.545V6h6.545v18H24V0z" />
            </svg>
            npm install
          </a>
        </div>
      </div>

      <div className="land-divider" />
      <footer className="land-footer">
        <div className="fl">
          <Image src={logo} className="fm" />
          <span className="fn">promptbuilder</span>
        </div>
        <div className="fr">Open source · MIT License</div>
      </footer>
    </div>
  );
}
