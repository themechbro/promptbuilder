import Workspace from "./components/Workspace";
import { KeyRound, ShieldCheck, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0b1020] text-slate-100 antialiased selection:bg-cyan-400/20">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b1020]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-white">
                  Prompt Builder
                </h1>
                <p className="text-sm text-slate-400">
                  Build, test, and chain prompts without losing your place.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <span className="rounded-md border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-emerald-200">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Local session
              </span>
            </span>
            <span className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5">
              <span className="flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                Keys stay in browser memory
              </span>
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <Workspace />
      </div>
    </main>
  );
}
