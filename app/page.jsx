import Workspace from "./components/Workspace";
export const metadata = {
  title: "Prompt Template Builder | Production Tool",
  description: "Build structured, optimized prompts using deterministic data-driven forms.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/30">
      {/* Outer Shell Layout */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Prompt Template Builder
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Build structured prompts in seconds. No blank page. No guessing.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono bg-slate-800/60 px-3 py-1.5 rounded-md border border-slate-700/50 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Runtime: Stateless Frontend ($0 Cost)
          </div>
        </div>
      </header>

      {/* Main Orchestrator Layer */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Workspace />
      </div>
    </main>
  );
}