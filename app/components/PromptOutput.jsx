import { useState, useEffect } from "react";

export default function PromptOutput({ 
  prompt, 
  tokenCount, 
  rawContentTokens,
  roughPrompt,
  setRoughPrompt,
  roughTokenCount,
  onActionTriggered,
  activeTab // Read directly from global parent controller
}) {
  const [copied, setCopied] = useState(false);
  const [showKeys, setShowKeys] = useState(false);

  // Secure API Session Key Memory States
  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");

  // Running Output States
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

  // Secure Session Hydration
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGeminiKey(sessionStorage.getItem("sandbox_sk_gemini") || "");
    setOpenaiKey(sessionStorage.getItem("sandbox_sk_openai") || "");
    setAnthropicKey(sessionStorage.getItem("sandbox_sk_anthropic") || "");
  }, []);

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
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = () => {
    if (isPromptEmpty) return;
    try {
      const blob = new Blob([prompt], { type: "text/markdown;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `optimized-prompt-${new Date().toISOString().split('T')[0]}.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onActionTriggered(); 
    } catch (err) {
      console.error(err);
    }
  };

  const handleLiveExecution = async () => {
    if (isPromptEmpty) return;

    if (geminiKey.trim()) {
      setGeminiLoading(true); setGeminiError(""); setGeminiOutput(""); setGeminiMetrics(null);
      fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "gemini", prompt, apiKey: geminiKey })
      })
        .then(res => res.json())
        .then(data => { if (data.error) throw new Error(data.error); setGeminiOutput(data.output); setGeminiMetrics(data.metrics); })
        .catch(err => setGeminiError(err.message))
        .finally(() => setGeminiLoading(false));
    }

    if (openaiKey.trim()) {
      setOpenaiLoading(true); setOpenaiError(""); setOpenaiOutput(""); setOpenaiMetrics(null);
      fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "openai", prompt, apiKey: openaiKey })
      })
        .then(res => res.json())
        .then(data => { if (data.error) throw new Error(data.error); setOpenaiOutput(data.output); setOpenaiMetrics(data.metrics); })
        .catch(err => setOpenaiError(err.message))
        .finally(() => setOpenaiLoading(false));
    }

    if (anthropicKey.trim()) {
      setAnthropicLoading(true); setAnthropicError(""); setAnthropicOutput(""); setAnthropicMetrics(null);
      fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "anthropic", prompt, apiKey: anthropicKey })
      })
        .then(res => res.json())
        .then(data => { if (data.error) throw new Error(data.error); setAnthropicOutput(data.output); setAnthropicMetrics(data.metrics); })
        .catch(err => setAnthropicError(err.message))
        .finally(() => setAnthropicLoading(false));
    }
  };

  const renderMarkdownContent = (text) => {
    if (!text) return text;
    if (text.includes("|") && text.includes("---")) {
      const lines = text.split("\n");
      let inTable = false;
      const processedHtml = [];

      lines.forEach((line) => {
        if (line.trim().startsWith("|")) {
          if (!inTable) {
            inTable = true;
            processedHtml.push('<div class="overflow-x-auto my-3 border border-slate-800 rounded-lg bg-slate-950/20"><table class="w-full text-left text-[11px] font-sans border-collapse">');
          }
          if (line.includes("---") || line.includes(":-")) return; 
          const cells = line.split("|").map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
          processedHtml.push('<tr class="border-b border-slate-800/80 hover:bg-slate-900/10 transition-colors">');
          cells.forEach((cell, idx) => {
            if (idx === 0) {
              processedHtml.push(`<td class="p-2.5 font-semibold text-slate-400 bg-slate-950/40 border-r border-slate-850 w-32 min-w-[120px] whitespace-nowrap align-top">${cell}</td>`);
            } else {
              processedHtml.push(`<td class="p-2.5 border-r border-slate-850 text-slate-300 align-top leading-relaxed">${cell}</td>`);
            }
          });
          processedHtml.push("</tr>");
        } else {
          if (inTable) { inTable = false; processedHtml.push("</table></div>"); }
          processedHtml.push(line + "\n");
        }
      });
      return <div dangerouslySetInnerHTML={{ __html: processedHtml.join("") }} className="prose prose-invert max-w-none" />;
    }
    return text;
  };

  const renderFormattedPrompt = (text) => {
    const parts = text.split(/(\[.*?\])/g);
    return parts.map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          <span key={index} className="text-indigo-400 font-bold block mt-4 mb-1 text-[11px] tracking-widest uppercase font-mono border-b border-slate-900 pb-0.5">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const configuredProviders = [
    { id: "gemini", key: geminiKey, loading: geminiLoading, output: geminiOutput, metrics: geminiMetrics, error: geminiError, name: "Gemini 2.5 Flash", color: "text-blue-400", dot: "bg-blue-400" },
    { id: "openai", key: openaiKey, loading: openaiLoading, output: openaiOutput, metrics: openaiMetrics, error: openaiError, name: "GPT-4o Mini", color: "text-emerald-400", dot: "bg-emerald-400" },
    { id: "anthropic", key: anthropicKey, loading: anthropicLoading, output: anthropicOutput, metrics: anthropicMetrics, error: anthropicError, name: "Claude 3.5 Haiku", color: "text-orange-400", dot: "bg-orange-400" }
  ].filter(p => p.key.trim() !== "");

  // Scaled for full screen layouts safely
  const gridLayoutClass = 
    configuredProviders.length === 1 ? "grid-cols-1" : 
    configuredProviders.length === 2 ? "grid-cols-1 md:grid-cols-2" : 
    "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  const hasAnyKey = geminiKey.trim() || openaiKey.trim() || anthropicKey.trim();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 flex flex-col h-full w-full">
      
      {/* --- SUB-VIEWPORT A: COMPILED TEMPLATE VIEW --- */}
      {activeTab === "template" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="rough-prompt-input" className="text-[11px] font-semibold text-slate-400 font-sans block">
              Baseline Target Matrix (Optional):
            </label>
            <textarea
              id="rough-prompt-input"
              rows={2}
              value={roughPrompt}
              onChange={(e) => setRoughPrompt(e.target.value)}
              placeholder="Paste your original unoptimized rough prompt to baseline telemetry comparison..."
              className="w-full bg-slate-950 border border-slate-800/80 rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder:text-slate-700 focus:outline-none focus:border-indigo-500 font-mono resize-none"
            />
          </div>

          {hasBaselinePrompt && (
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-2 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-bold font-mono tracking-wider text-slate-500 uppercase">Telemetry Evaluation Matrix</h3>
                <span className="text-[9px] text-slate-600 font-sans italic">*Structure mitigates output rambling behavior</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                <div className="bg-slate-900/40 border border-slate-800 p-2 rounded-lg">
                  <span className="block text-[10px] text-slate-500 mb-0.5">Your Content</span>
                  <span className="font-bold text-slate-400">{rawContentTokens}</span>
                </div>
                <div className="bg-slate-900/40 border border-slate-800 p-2 rounded-lg">
                  <span className="block text-[10px] text-slate-500 mb-0.5">Generated Prompt</span>
                  <span className="font-bold text-cyan-400">{tokenCount}</span>
                </div>
                <div className="bg-slate-900/40 border border-indigo-950 p-2 rounded-lg bg-indigo-950/10">
                  <span className="block text-[10px] text-slate-500 mb-0.5">Tokens Saved</span>
                  <span className={`font-bold ${roughTokenCount - tokenCount >= 0 ? "text-emerald-400" : "text-amber-500"}`}>
                    {roughTokenCount - tokenCount}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-slate-800/60 my-2" />
          <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase font-mono">Step 2: Compiled Output</h2>

          <div className="w-full min-h-[260px] max-h-[380px] bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs whitespace-pre-wrap overflow-y-auto text-slate-300 leading-relaxed">
            {isPromptEmpty ? (
              <div className="h-48 flex items-center justify-center text-center text-slate-600 italic font-sans text-xs">
                Populate the configuration schema form variables on the left grid canvas.
              </div>
            ) : (
              renderFormattedPrompt(prompt)
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <button
              type="button"
              disabled={isPromptEmpty}
              onClick={handleCopy}
              className={`sm:col-span-8 py-2.5 rounded-lg text-xs font-semibold font-mono uppercase border flex items-center justify-center ${isPromptEmpty ? "bg-slate-800/20 border-slate-800 text-slate-600 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white"}`}
            >
              {copied ? "Copied!" : "Copy Prompt Structure"}
            </button>
            <button
              type="button"
              disabled={isPromptEmpty}
              onClick={handleDownload}
              className={`sm:col-span-4 py-2.5 rounded-lg text-xs font-semibold font-mono uppercase border flex items-center justify-center ${isPromptEmpty ? "bg-slate-800/20 border-slate-800 text-slate-600 cursor-not-allowed" : "bg-slate-800 text-slate-300 border-slate-700"}`}
            >
              Export
            </button>
          </div>
        </div>
      )}

      {/* --- SUB-VIEWPORT B: ENHANCED FULL WIDTH SANDBOX --- */}
      {activeTab === "sandbox" && (
        <div className="space-y-4 flex flex-col h-full w-full animate-fadeIn">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h2 className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase">
              Live Multi-Runtime Execution Dashboard
            </h2>
            <button
              type="button"
              onClick={() => setShowKeys(!showKeys)}
              className="text-[11px] font-mono border border-slate-800 bg-slate-950 px-3 py-1 rounded-md text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all shadow"
            >
              {showKeys ? "Hide Setup Panel" : "⚙️ Manage API Keys"}
            </button>
          </div>

          {/* Key Management Drawer */}
          {(showKeys || !hasAnyKey) && (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 shadow-inner max-w-xl">
              <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                <span className="text-[10px] font-bold font-mono uppercase text-indigo-400">Adaptive API Key Manager</span>
                <span className="text-[9px] text-slate-600 font-sans">Stored in transient memory</span>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-500 block mb-1">GEMINI API KEY (Google AI Studio Free Tier)</label>
                  <input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder={geminiKey ? "••••••••••••••••••••" : "Paste Gemini API Key..."}
                    className="w-full bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded text-xs text-slate-300 font-mono focus:outline-none focus:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-500 block mb-1">OPENAI API KEY (Optional)</label>
                  <input
                    type="password"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder={openaiKey ? "••••••••••••••••••••" : "Paste OpenAI API Key..."}
                    className="w-full bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded text-xs text-slate-300 font-mono focus:outline-none focus:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-500 block mb-1">ANTHROPIC API KEY (Optional)</label>
                  <input
                    type="password"
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                    placeholder={anthropicKey ? "••••••••••••••••••••" : "Paste Anthropic API Key..."}
                    className="w-full bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded text-xs text-slate-300 font-mono focus:outline-none focus:border-slate-700"
                  />
                </div>
                <button type="button" onClick={handleSaveKeys} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold py-1.5 rounded transition-all">
                  Commit Keys to Memory
                </button>
              </div>
            </div>
          )}

          {/* Expanded Columns Grid */}
          {!hasAnyKey ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-600 border border-dashed border-slate-800 rounded-xl p-6 font-sans">
              <span className="text-sm font-medium mb-1 text-slate-400">No Target Engines Configured</span>
              <span className="text-xs text-slate-600 max-w-xs">Input your free Gemini developer key to spin up the execution panel viewports.</span>
            </div>
          ) : (
            <div className={`grid ${gridLayoutClass} gap-6 w-full flex-grow`}>
              {configuredProviders.map((provider) => (
                <div key={provider.id} className="bg-slate-950 border border-slate-850 rounded-xl p-5 flex flex-col min-h-[380px] w-full shadow-lg">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
                    <span className={`text-xs font-bold ${provider.color} font-mono flex items-center gap-1.5`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${provider.dot}`} />
                      {provider.name}
                    </span>
                    {provider.metrics && (
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-900/60 border border-slate-850 px-2 py-0.5 rounded-md">
                        In: <strong className="text-slate-400">{provider.metrics.inputTokens}</strong> | Out: <strong className="text-slate-400">{provider.metrics.outputTokens}</strong>
                      </span>
                    )}
                  </div>
                  <div className="flex-grow overflow-y-auto font-sans text-xs text-slate-300 leading-relaxed pt-3 whitespace-pre-wrap">
                    {provider.loading ? (
                      <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-500 font-mono text-[11px]">
                        <span className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${provider.id === 'gemini' ? 'border-blue-400' : provider.id === 'openai' ? 'border-emerald-400' : 'border-orange-400'}`} />
                        Streaming Node Connection...
                      </div>
                    ) : provider.error ? (
                      <span className="text-rose-500/90 font-mono text-[11px]">⚠️ Dispatch Error: {provider.error}</span>
                    ) : (
                      renderMarkdownContent(provider.output) || <span className="text-slate-700 italic">Awaiting execution run...</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Master Execution CTA Button */}
          <button
            type="button"
            disabled={isPromptEmpty || !hasAnyKey || geminiLoading || openaiLoading || anthropicLoading}
            onClick={handleLiveExecution}
            className={`w-full py-3.5 rounded-xl text-xs font-bold font-mono tracking-wider uppercase border flex items-center justify-center gap-2 ${isPromptEmpty || !hasAnyKey ? "bg-slate-800/20 border-slate-800 text-slate-600 cursor-not-allowed" : geminiLoading || openaiLoading || anthropicLoading ? "bg-amber-500/10 border-amber-500/40 text-amber-400 cursor-wait" : "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-900/20 transition-all active:scale-[0.99]"}`}
          >
            {geminiLoading || openaiLoading || anthropicLoading ? (
              <><span className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />Processing Active Runtimes...</>
            ) : !hasAnyKey ? (
              "Initialize Active Credentials to Run"
            ) : configuredProviders.length === 1 ? (
              `⚡ Execute Live Runtime Prompt (${configuredProviders[0].name})`
            ) : (
              `⚡ Run Concurrent Multi-Model Assessment (${configuredProviders.length} Active Engines)`
            )}
          </button>
        </div>
      )}

    </div>
  );
}