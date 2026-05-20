import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Check,
  Clipboard,
  Download,
  FileText,
  Gauge,
  KeyRound,
  Loader2,
  Play,
  Save,
  Sparkles,
  TestTube2,
} from "lucide-react";

export default function PromptOutput({
  prompt,
  tokenCount,
  rawContentTokens,
  roughPrompt,
  setRoughPrompt,
  roughTokenCount,
  onActionTriggered,
  activeTab,
  setChainBuffer,
  versions = [],
  onRestoreVersion,
  geminiKey,
  setGeminiKey,
  openaiKey,
  setOpenaiKey,
  anthropicKey,
  setAnthropicKey,
}) {
  const [copied, setCopied] = useState(false);
  const [showKeys, setShowKeys] = useState(false);

  const executionButtonRef = useRef(null);
  const copyButtonRef = useRef(null);

  const [geminiOutput, setGeminiOutput] = useState("");
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiMetrics, setGeminiMetrics] = useState(null);
  const [geminiError, setGeminiError] = useState("");

  const [openaiOutput, setOpenaiOutput] = useState("");
  const [openaiLoading, setOpenaiLoading] = useState(false);
  const [openaiMetrics, setOpenaiMetrics] = useState(null);
  const [openaiError, setOpenaiError] = useState("");

  const [anthropicOutput, setAnthropicOutput] = useState("");
  const [anthropicLoading, setAnthropicLoading] = useState(false);
  const [anthropicMetrics, setAnthropicMetrics] = useState(null);
  const [anthropicError, setAnthropicError] = useState("");

  const isPromptEmpty = !prompt || prompt.trim() === "";
  const hasBaselinePrompt = roughPrompt && roughPrompt.trim() !== "";
  const isAnyModelLoading = geminiLoading || openaiLoading || anthropicLoading;
  const hasAnyKey = geminiKey.trim() || openaiKey.trim() || anthropicKey.trim();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();

        if (activeTab === "sandbox" && executionButtonRef.current && !executionButtonRef.current.disabled) {
          executionButtonRef.current.click();
        }

        if (activeTab === "template" && copyButtonRef.current && !copyButtonRef.current.disabled) {
          copyButtonRef.current.click();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, isPromptEmpty, isAnyModelLoading]);

  const handleSaveKeys = () => {
    sessionStorage.setItem("sandbox_sk_gemini", geminiKey);
    sessionStorage.setItem("sandbox_sk_openai", openaiKey);
    sessionStorage.setItem("sandbox_sk_anthropic", anthropicKey);
    setShowKeys(false);
  };

  const handleCopy = async () => {
    if (isPromptEmpty) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      onActionTriggered();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Clipboard copy failed:", error);
    }
  };

  const handleDownload = () => {
    if (isPromptEmpty) return;
    try {
      const blob = new Blob([prompt], { type: "text/markdown;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `prompt-${new Date().toISOString().split("T")[0]}.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onActionTriggered();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const commitChainOutput = (output) => {
    if (typeof output !== "string" || output.trim() === "") return;
    setChainBuffer(output);
  };

  const runProvider = async ({ id, key, setLoading, setOutput, setMetrics, setError }) => {
    if (!key.trim()) return;

    setLoading(true);
    setError("");
    setOutput("");
    setMetrics(null);

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: id, prompt, apiKey: key }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setOutput(data.output);
      setMetrics(data.metrics);
      commitChainOutput(data.output);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLiveExecution = async () => {
    if (isPromptEmpty) return;

    await Promise.all([
      runProvider({
        id: "gemini",
        key: geminiKey,
        setLoading: setGeminiLoading,
        setOutput: setGeminiOutput,
        setMetrics: setGeminiMetrics,
        setError: setGeminiError,
      }),
      runProvider({
        id: "openai",
        key: openaiKey,
        setLoading: setOpenaiLoading,
        setOutput: setOpenaiOutput,
        setMetrics: setOpenaiMetrics,
        setError: setOpenaiError,
      }),
      runProvider({
        id: "anthropic",
        key: anthropicKey,
        setLoading: setAnthropicLoading,
        setOutput: setAnthropicOutput,
        setMetrics: setAnthropicMetrics,
        setError: setAnthropicError,
      }),
    ]);
  };

  const renderFormattedPrompt = (text) => {
    const parts = text.split(/(\[.*?\])/g);
    return parts.map((part, index) => {
      if (part.startsWith("[") && part.endsWith("]")) {
        return (
          <span key={index} className="mb-1 mt-4 block border-b border-white/10 pb-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-300">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const configuredProviders = [
    {
      id: "gemini",
      key: geminiKey,
      loading: geminiLoading,
      output: geminiOutput,
      metrics: geminiMetrics,
      error: geminiError,
      name: "Gemini",
      accent: "text-sky-200",
      dot: "bg-sky-300",
    },
    {
      id: "openai",
      key: openaiKey,
      loading: openaiLoading,
      output: openaiOutput,
      metrics: openaiMetrics,
      error: openaiError,
      name: "OpenAI",
      accent: "text-emerald-200",
      dot: "bg-emerald-300",
    },
    {
      id: "anthropic",
      key: anthropicKey,
      loading: anthropicLoading,
      output: anthropicOutput,
      metrics: anthropicMetrics,
      error: anthropicError,
      name: "Anthropic",
      accent: "text-amber-200",
      dot: "bg-amber-300",
    },
  ].filter((provider) => provider.key.trim() !== "");

  const gridLayoutClass =
    configuredProviders.length === 1
      ? "grid-cols-1"
      : configuredProviders.length === 2
        ? "grid-cols-1 md:grid-cols-2"
        : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";

  return (
    <div className="flex h-full w-full flex-col rounded-xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10">
      {activeTab === "template" && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-cyan-300">
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  Output
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white">Your compiled prompt</h2>
              </div>
              <span className="rounded-md border border-white/10 bg-[#0f172a] px-2.5 py-1 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  {tokenCount} tokens
                </span>
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">Copy it, export it, or test it in the sandbox.</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0f172a]/60 p-4">
            <label htmlFor="rough-prompt-input" className="mb-2 block text-sm font-medium text-slate-200">
              Optional baseline prompt
            </label>
            <textarea
              id="rough-prompt-input"
              rows={3}
              value={roughPrompt}
              onChange={(event) => setRoughPrompt(event.target.value)}
              placeholder="Paste your original prompt to compare token counts..."
              className="w-full resize-none rounded-lg border border-white/10 bg-[#0b1020] px-3 py-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-300/60"
            />
          </div>

          {hasBaselinePrompt && (
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-white/10 bg-[#0f172a]/70 p-3 text-center">
                <span className="flex items-center justify-center gap-1 text-xs text-slate-500"><FileText className="h-3.5 w-3.5" aria-hidden="true" />Source</span>
                <strong className="mt-1 block text-slate-200">{rawContentTokens}</strong>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#0f172a]/70 p-3 text-center">
                <span className="flex items-center justify-center gap-1 text-xs text-slate-500"><Clipboard className="h-3.5 w-3.5" aria-hidden="true" />Compiled</span>
                <strong className="mt-1 block text-cyan-200">{tokenCount}</strong>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#0f172a]/70 p-3 text-center">
                <span className="flex items-center justify-center gap-1 text-xs text-slate-500"><Gauge className="h-3.5 w-3.5" aria-hidden="true" />Difference</span>
                <strong className={`mt-1 block ${roughTokenCount - tokenCount >= 0 ? "text-emerald-300" : "text-amber-300"}`}>
                  {roughTokenCount - tokenCount}
                </strong>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-white">Prompt preview</h3>
            {versions.length > 1 && (
              <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#0f172a] p-1 text-xs">
                {versions.map((version, index) => (
                  <button
                    key={`${version}-${index}`}
                    type="button"
                    onClick={() => onRestoreVersion(version)}
                    className={`rounded-md px-2 py-1 transition-all ${
                      prompt === version ? "bg-cyan-300/15 text-cyan-200" : "text-slate-500 hover:text-slate-200"
                    }`}
                  >
                    v{versions.length - index}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="min-h-[280px] max-h-[460px] w-full overflow-y-auto rounded-xl border border-white/10 bg-[#0b1020] p-4 font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">
            {isPromptEmpty ? (
              <div className="flex h-56 items-center justify-center text-center font-sans text-sm text-slate-600">
                Fill in the workflow fields to generate a prompt preview.
              </div>
            ) : (
              renderFormattedPrompt(prompt)
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
            <button
              type="button"
              ref={copyButtonRef}
              disabled={isPromptEmpty}
              onClick={handleCopy}
              className={`rounded-lg border px-4 py-3 text-sm font-semibold transition-all sm:col-span-8 ${
                isPromptEmpty
                  ? "cursor-not-allowed border-white/10 bg-white/[0.03] text-slate-600"
                  : "border-cyan-300/40 bg-cyan-300/15 text-cyan-100 hover:bg-cyan-300/25"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Clipboard className="h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied" : "Copy prompt"}
              </span>
              <kbd className="ml-2 hidden rounded border border-white/10 bg-[#0b1020] px-1.5 py-0.5 text-[10px] font-normal text-slate-500 sm:inline-block">
                Ctrl Enter
              </kbd>
            </button>
            <button
              type="button"
              disabled={isPromptEmpty}
              onClick={handleDownload}
              className={`rounded-lg border px-4 py-3 text-sm font-semibold transition-all sm:col-span-4 ${
                isPromptEmpty
                  ? "cursor-not-allowed border-white/10 bg-white/[0.03] text-slate-600"
                  : "border-white/10 bg-[#0f172a] text-slate-200 hover:border-white/20"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Download className="h-4 w-4" aria-hidden="true" />
                Export
              </span>
            </button>
          </div>
        </div>
      )}

      {activeTab === "sandbox" && (
        <div className="flex h-full w-full flex-col space-y-4">
          <div className="flex flex-col justify-between gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-cyan-300">
                <TestTube2 className="h-3.5 w-3.5" aria-hidden="true" />
                Sandbox
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">Run the prompt against your models</h2>
              <p className="mt-1 text-sm text-slate-500">Successful results are saved to the chain buffer automatically.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowKeys(!showKeys)}
              className="rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-xs font-semibold text-slate-300 transition-all hover:border-white/20 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                {showKeys ? "Hide keys" : "Manage keys"}
              </span>
            </button>
          </div>

          {(showKeys || !hasAnyKey) && (
            <div className="max-w-2xl rounded-xl border border-white/10 bg-[#0f172a]/70 p-4">
              <div className="mb-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <KeyRound className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                  API keys
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">Stored only in this browser session.</p>
              </div>
              <div className="grid gap-3">
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-slate-400">Gemini key</span>
                  <input type="password" value={geminiKey} onChange={(event) => setGeminiKey(event.target.value)} placeholder="Paste Gemini API key" className="w-full rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-300/60" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-slate-400">OpenAI key</span>
                  <input type="password" value={openaiKey} onChange={(event) => setOpenaiKey(event.target.value)} placeholder="Optional OpenAI API key" className="w-full rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-300/60" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-slate-400">Anthropic key</span>
                  <input type="password" value={anthropicKey} onChange={(event) => setAnthropicKey(event.target.value)} placeholder="Optional Anthropic API key" className="w-full rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-300/60" />
                </label>
                <button type="button" onClick={handleSaveKeys} className="rounded-lg border border-cyan-300/40 bg-cyan-300/15 px-4 py-2 text-sm font-semibold text-cyan-100 transition-all hover:bg-cyan-300/25">
                  <span className="flex items-center justify-center gap-2">
                    <Save className="h-4 w-4" aria-hidden="true" />
                    Save keys
                  </span>
                </button>
              </div>
            </div>
          )}

          {!hasAnyKey ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#0f172a]/40 p-6 text-center">
              <KeyRound className="mb-3 h-8 w-8 text-slate-500" aria-hidden="true" />
              <span className="text-base font-semibold text-slate-300">Add at least one API key to run this prompt.</span>
              <span className="mt-1 max-w-md text-sm text-slate-500">Gemini is enough to get started. OpenAI and Anthropic are optional comparison panels.</span>
            </div>
          ) : (
            <div className={`grid ${gridLayoutClass} flex-grow gap-4`}>
              {configuredProviders.map((provider) => (
                <div key={provider.id} className="flex min-h-[380px] flex-col rounded-xl border border-white/10 bg-[#0f172a]/70 p-4">
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <span className={`flex items-center gap-2 text-sm font-semibold ${provider.accent}`}>
                      <Bot className="h-4 w-4" aria-hidden="true" />
                      <span className={`h-2 w-2 rounded-full ${provider.dot}`} />
                      {provider.name}
                    </span>
                    {provider.metrics && (
                      <span className="rounded-md border border-white/10 bg-[#0b1020] px-2 py-1 text-[11px] text-slate-500">
                        {provider.metrics.inputTokens} in / {provider.metrics.outputTokens} out
                      </span>
                    )}
                  </div>
                  <div className="flex-grow overflow-y-auto pt-3 text-sm leading-relaxed whitespace-pre-wrap text-slate-300">
                    {provider.loading ? (
                      <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-slate-500">
                        <Loader2 className={`h-5 w-5 animate-spin ${provider.id === "gemini" ? "text-sky-300" : provider.id === "openai" ? "text-emerald-300" : "text-amber-300"}`} aria-hidden="true" />
                        Running...
                      </div>
                    ) : provider.error ? (
                      <span className="text-sm text-rose-300">Error: {provider.error}</span>
                    ) : (
                      provider.output || <span className="text-slate-600">Run the prompt to see this model response.</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            ref={executionButtonRef}
            disabled={isPromptEmpty || !hasAnyKey || isAnyModelLoading}
            onClick={handleLiveExecution}
            className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
              isPromptEmpty || !hasAnyKey
                ? "cursor-not-allowed border-white/10 bg-white/[0.03] text-slate-600"
                : isAnyModelLoading
                  ? "cursor-wait border-amber-300/30 bg-amber-300/10 text-amber-200"
                  : "border-cyan-300/40 bg-cyan-300/15 text-cyan-100 hover:bg-cyan-300/25"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              {isAnyModelLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              {isAnyModelLoading ? "Running models..." : !hasAnyKey ? "Add keys to run" : "Run prompt"}
            </span>
            {!isAnyModelLoading && hasAnyKey && (
              <kbd className="ml-2 hidden rounded border border-white/10 bg-[#0b1020] px-1.5 py-0.5 text-[10px] font-normal text-slate-500 sm:inline-block">
                Ctrl Enter
              </kbd>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
