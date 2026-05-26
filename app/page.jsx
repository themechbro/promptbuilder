"use client";

import { useEffect } from "react";
import Workspace from "./components/Workspace";
import { KeyRound, ShieldCheck, Sparkles } from "lucide-react";

export default function HomePage() {
  useEffect(() => {
    // 1. Initialize tracking timers on load
    const startTime = Date.now();
    const referrer = typeof document !== "undefined" ? document.referrer : "";

    // 2. Classify client hardware infrastructure accurately
    const parseDevice = () => {
      if (typeof window === "undefined") return "Desktop";
      const ua = window.navigator.userAgent;
      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua))
        return "Tablet";
      if (
        /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(
          ua,
        )
      )
        return "Mobile";
      return "Desktop";
    };

    const deviceType = parseDevice();

    // 3. Dispatch data handler function
    const sendAnalyticsPayload = () => {
      const endTime = Date.now();
      // Calculate total duration elapsed in clean seconds
      const durationSeconds = Math.round((endTime - startTime) / 1000);

      // Do not log negligible or instantaneous accidental page bounces (under 1 second)
      if (durationSeconds < 1) return;

      const payload = JSON.stringify({
        device: deviceType,
        referrer: referrer || "Direct",
        duration: durationSeconds,
      });

      // Execute non-blocking beacon stream to avoid impacting main browser layout threads
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true, // Crucial parameter to maintain payload continuity post-tab eviction
      }).catch((err) =>
        console.warn("Analytics telemetry transmission omitted:", err),
      );
    };

    // 4. Register structural state lifecycle listeners
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendAnalyticsPayload();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Fallback cleanup hook assignment
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#0b1020] text-slate-100 antialiased selection:bg-cyan-400/20">
      <header className="relative z-40 border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/30">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
          {/* Title Section */}
          <div className="flex items-center gap-4">
            {/* Icon Wrapper with App-Theme Glow */}
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
              {/* Ambient inner glow */}
              <div className="absolute inset-0 rounded-xl bg-indigo-400/10 blur-md pointer-events-none" />
            </div>

            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-100 leading-snug max-w-lg">
              Build, test, and chain prompts without losing your place.
            </h1>
          </div>

          {/* Status / Security Badges */}
          <div className="flex flex-wrap items-center gap-3 mt-1 sm:mt-0">
            {/* Local Session Tag (Semantic Success/Secure Color) */}
            <div className="group flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20 cursor-default">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>Local session</span>
              {/* Live Ping Indicator */}
              <span className="relative flex h-2 w-2 ml-0.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
            </div>

            {/* Privacy Tag */}
            <div className="flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-md transition-colors hover:bg-slate-800/80 cursor-default shadow-sm">
              <KeyRound className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <span>Keys stay in browser</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <Workspace />
      </div>
    </main>
  );
}
