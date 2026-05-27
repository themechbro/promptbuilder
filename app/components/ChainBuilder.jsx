"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  Play,
  Loader2,
  ChevronDown,
  ChevronUp,
  Link,
  RotateCcw,
  Save,
  FolderOpen,
  Check,
  X,
  ArrowDown,
} from "lucide-react";
import {
  runChain,
  saveChain,
  loadChains,
  deleteChain,
  createBlankStep,
} from "@/utils/chainRunner";
import SelectComponentModal from "../components/SelectComponentModal";
import ReactMarkdown from "react-markdown";

const TYPE_COLORS = {
  persona: "text-violet-400 bg-violet-500/10 border-violet-500/30",
  protocol: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  format: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  template: "text-amber-400 bg-amber-500/10 border-amber-500/30",
};

// Individual step card
function StepCard({
  step,
  index,
  total,
  result,
  isRunning,
  onUpdate,
  onRemove,
}) {
  const [expanded, setExpanded] = useState(true);
  const [selectModal, setSelectModal] = useState(null);
  const detectedVars = [
    ...new Set(
      [...(step.customTemplate || "").matchAll(/{{([a-zA-Z0-9_-]+)}}/g)]
        .map((m) => m[1])
        .filter((v) => v !== "previous_output"),
    ),
  ];

  function handleComponentSelect(type, component) {
    if (type === "template") {
      onUpdate(step.id, {
        [type]: component,
        customTemplate: component.content,
      });
    } else {
      onUpdate(step.id, { [type]: component });
    }
    setSelectModal(null);
  }

  function clearComponent(type) {
    if (type === "template") {
      onUpdate(step.id, { template: null, customTemplate: "" });
    } else {
      onUpdate(step.id, { [type]: null });
    }
  }

  const statusColor = result
    ? "border-green-500/30 bg-green-500/5"
    : isRunning
      ? "border-indigo-500/40 bg-indigo-500/5"
      : "border-slate-800/80";

  return (
    <div className={`rounded-2xl border transition-all ${statusColor}`}>
      {/* Step header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
        onClick={() => setExpanded((p) => !p)}
      >
        {/* Step number */}
        <div
          className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold flex-shrink-0 ${
            result
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : isRunning
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40"
                : "bg-slate-800 text-slate-400 border border-slate-700"
          }`}
        >
          {result ? (
            <Check size={13} />
          ) : isRunning ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            index + 1
          )}
        </div>

        {/* Label */}
        <input
          type="text"
          value={step.label}
          onChange={(e) => {
            e.stopPropagation();
            onUpdate(step.id, { label: e.target.value });
          }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 bg-transparent text-sm font-medium text-slate-200 focus:outline-none placeholder:text-slate-600"
          placeholder={`Step ${index + 1}`}
        />

        {/* Component pills */}
        <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
          {["persona", "protocol", "format", "template"].map((type) =>
            step[type] ? (
              <span
                key={type}
                className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${TYPE_COLORS[type]}`}
              >
                {step[type].name.split(" ")[0]}
              </span>
            ) : null,
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {total > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(step.id);
              }}
              className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          )}
          {expanded ? (
            <ChevronUp size={14} className="text-slate-600" />
          ) : (
            <ChevronDown size={14} className="text-slate-600" />
          )}
        </div>
      </div>

      {/* Step body */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-800/60 pt-4">
          {/* Component selectors */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {["persona", "protocol", "format", "template"].map((type) => (
              <div key={type} className="relative">
                <button
                  onClick={() => setSelectModal(type)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                    step[type]
                      ? TYPE_COLORS[type]
                      : "bg-slate-900/60 border-slate-800 text-slate-500 hover:border-slate-700"
                  }`}
                >
                  <div className="text-[10px] font-mono font-semibold uppercase tracking-widest mb-1 opacity-70">
                    {type}
                  </div>
                  <div className="text-xs font-medium truncate">
                    {step[type] ? step[type].name : "None"}
                  </div>
                </button>
                {step[type] && (
                  <button
                    onClick={() => clearComponent(type)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <X size={9} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Template textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-widest">
                Template
              </label>
              {index > 0 && (
                <span className="text-[11px] font-mono text-indigo-400/70 flex items-center gap-1">
                  <Link size={10} />
                  {"{{previous_output}} available"}
                </span>
              )}
            </div>
            <textarea
              value={step.customTemplate}
              onChange={(e) =>
                onUpdate(step.id, { customTemplate: e.target.value })
              }
              placeholder={
                index > 0
                  ? `Use {{previous_output}} to reference the previous step's result...`
                  : "Write your prompt template here. Use {{variable}} for inputs..."
              }
              rows={4}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500/60 transition-all resize-none leading-relaxed placeholder:text-slate-700"
            />
          </div>

          {/* Detected variables (excluding previous_output) */}
          {detectedVars.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-widest">
                Variables
              </p>
              {detectedVars.map((v) => (
                <div key={v} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-2 py-1 rounded-lg w-36 shrink-0 truncate">
                    {`{{${v}}}`}
                  </span>
                  <input
                    type="text"
                    placeholder={`Value for ${v}…`}
                    value={step.variables?.[v] ?? ""}
                    onChange={(e) =>
                      onUpdate(step.id, {
                        variables: { ...step.variables, [v]: e.target.value },
                      })
                    }
                    className="flex-1 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500/60 transition-all placeholder:text-slate-700"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Step result */}
          {result && (
            <div className="bg-slate-950/60 border border-green-500/20 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[11px] font-mono text-green-500 font-semibold uppercase tracking-widest">
                  Output
                </span>
                {result.metrics && (
                  <span className="ml-auto text-[11px] font-mono text-slate-600">
                    {result.metrics.totalTokens} tokens
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
                <ReactMarkdown>{result.output}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Streaming indicator */}
          {isRunning && (
            <div className="bg-slate-950/60 border border-indigo-500/20 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <Loader2 size={12} className="animate-spin text-indigo-400" />
                <span className="text-[11px] font-mono text-indigo-400">
                  Running…
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Select modal */}
      {selectModal && (
        <SelectComponentModal
          type={selectModal}
          onClose={() => setSelectModal(null)}
          onSelect={(component) =>
            handleComponentSelect(selectModal, component)
          }
        />
      )}
    </div>
  );
}

// Main ChainBuilder component
export default function ChainBuilder({
  apiKeys,
  selectedModel,
  onModelChange,
}) {
  const [steps, setSteps] = useState([createBlankStep(0)]);
  const [chainName, setChainName] = useState("Untitled Chain");
  const [results, setResults] = useState({});
  const [runningStep, setRunningStep] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [savedChains, setSavedChains] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [activeChainId, setActiveChainId] = useState(null);
  const bottomRef = useRef(null);
  const [localApiKey, setLocalApiKey] = useState(apiKeys[selectedModel] || "");

  useEffect(() => {
    loadChains().then(setSavedChains);
  }, []);

  useEffect(() => {
    if (runningStep !== null) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [runningStep, results]);

  useEffect(() => {
    setLocalApiKey(apiKeys[selectedModel] || "");
  }, [selectedModel, apiKeys]);

  function addStep() {
    setSteps((prev) => [...prev, createBlankStep(prev.length)]);
  }

  function removeStep(id) {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  }

  function updateStep(id, updates) {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    );
  }

  function resetChain() {
    setResults({});
    setRunningStep(null);
    setError(null);
  }

  function newChain() {
    setSteps([createBlankStep(0)]);
    setChainName("Untitled Chain");
    setResults({});
    setRunningStep(null);
    setError(null);
    setActiveChainId(null);
  }

  async function handleRun() {
    const apiKey = localApiKey || apiKeys[selectedModel];
    if (!apiKey?.trim()) {
      setError("Add your API key above or in the RUN tab.");
      return;
    }

    if (steps.every((s) => !s.customTemplate?.trim())) {
      setError("At least one step needs a template.");
      return;
    }

    setIsRunning(true);
    setResults({});
    setError(null);

    await runChain({
      steps,
      provider: selectedModel,
      apiKey,
      onStepStart: (i) => setRunningStep(i),
      onStepChunk: (i, text) =>
        setResults((prev) => ({
          ...prev,
          [`${i}_streaming`]: text,
        })),
      onStepComplete: (i, result) => {
        setResults((prev) => {
          const next = { ...prev };
          delete next[`${i}_streaming`];
          next[i] = result;
          return next;
        });
        setRunningStep(null);
      },
      onError: (i, err) => {
        setError(`Step ${i + 1} failed: ${err.message}`);
        setRunningStep(null);
      },
    });

    setIsRunning(false);
    setRunningStep(null);
  }

  async function handleSave() {
    const chain = {
      id: activeChainId || crypto.randomUUID(),
      name: chainName,
      steps,
      createdAt: new Date().toISOString(),
    };
    setActiveChainId(chain.id);
    const updated = await saveChain(chain);
    setSavedChains(updated);
  }

  async function handleLoadChain(chain) {
    setSteps(chain.steps);
    setChainName(chain.name);
    setResults({});
    setRunningStep(null);
    setError(null);
    setActiveChainId(chain.id);
    setShowSaved(false);
  }

  async function handleDeleteChain(chainId, e) {
    e.stopPropagation();
    const updated = await deleteChain(chainId);
    setSavedChains(updated);
    if (activeChainId === chainId) newChain();
  }

  const MODEL_LABELS = {
    gemini: "Gemini",
    openai: "GPT-4o Mini",
    anthropic: "Claude Haiku",
  };

  const hasApiKey = !!(localApiKey || apiKeys[selectedModel])?.trim();
  const completedCount = Object.keys(results).filter(
    (k) => !k.includes("streaming"),
  ).length;

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
      {/* Chain header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <input
          type="text"
          value={chainName}
          onChange={(e) => setChainName(e.target.value)}
          className="flex-1 bg-transparent text-sm font-semibold text-slate-200 focus:outline-none border-b border-transparent focus:border-slate-700 pb-0.5 transition-colors"
        />

        <div className="flex items-center gap-2">
          {/* Model indicator */}
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs font-mono text-slate-400 focus:outline-none focus:border-indigo-500/60 transition-colors cursor-pointer"
          >
            <option value="gemini">Gemini</option>
            <option value="openai">GPT-4o Mini</option>
            <option value="anthropic">Claude Haiku</option>
          </select>

          <input
            type="password"
            value={localApiKey}
            onChange={(e) => {
              const val = e.target.value;
              setLocalApiKey(val);
              // Write to same sessionStorage key RUN tab uses
              const storageKey =
                selectedModel === "gemini"
                  ? "sandbox_sk_gemini"
                  : selectedModel === "openai"
                    ? "sandbox_sk_openai"
                    : "sandbox_sk_anthropic";
              sessionStorage.setItem(storageKey, val);
            }}
            placeholder="API key…"
            className="w-40 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500/60 transition-all placeholder:text-slate-700"
          />

          <button
            onClick={() => setShowSaved((p) => !p)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-all"
          >
            <FolderOpen size={12} />
            {savedChains.length > 0 && (
              <span className="text-slate-600">{savedChains.length}</span>
            )}
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-all"
          >
            <Save size={12} />
          </button>

          <button
            onClick={newChain}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-all"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Saved chains drawer */}
      {showSaved && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex-shrink-0">
          {savedChains.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-2">
              No saved chains yet.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {savedChains.map((chain) => (
                <div
                  key={chain.id}
                  onClick={() => handleLoadChain(chain)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                    activeChainId === chain.id
                      ? "bg-indigo-600/20 border border-indigo-500/30"
                      : "hover:bg-slate-800"
                  }`}
                >
                  <div>
                    <p className="text-xs font-medium text-slate-200">
                      {chain.name}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      {chain.steps.length} step
                      {chain.steps.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteChain(chain.id, e)}
                    className="text-slate-600 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Progress bar */}
      {isRunning && (
        <div className="flex-shrink-0 flex items-center gap-3">
          <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-slate-500 flex-shrink-0">
            {completedCount}/{steps.length}
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex-shrink-0 bg-red-500/8 border border-red-500/25 rounded-xl px-4 py-3">
          <p className="text-xs text-red-400 font-mono">{error}</p>
        </div>
      )}

      {/* Steps list */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {steps.map((step, index) => (
          <div key={step.id}>
            <StepCard
              step={step}
              index={index}
              total={steps.length}
              result={results[index]}
              isRunning={runningStep === index}
              onUpdate={updateStep}
              onRemove={removeStep}
            />
            {/* Arrow between steps */}
            {index < steps.length - 1 && (
              <div className="flex justify-center py-1">
                <ArrowDown size={14} className="text-slate-700" />
              </div>
            )}
          </div>
        ))}

        {/* Add step button */}
        <button
          onClick={addStep}
          disabled={isRunning}
          className="w-full py-2.5 border border-dashed border-slate-800 hover:border-indigo-500/40 rounded-xl text-xs text-slate-600 hover:text-indigo-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Plus size={13} />
          Add Step
        </button>

        <div ref={bottomRef} />
      </div>

      {/* Run footer */}
      <div className="flex items-center gap-3 flex-shrink-0 pt-2 border-t border-slate-800/60">
        {completedCount > 0 && !isRunning && (
          <button
            onClick={resetChain}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-all"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}
        <button
          onClick={handleRun}
          disabled={isRunning || !hasApiKey}
          title={!hasApiKey ? "Add API key in RUN tab" : ""}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
        >
          {isRunning ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Running Step {(runningStep ?? 0) + 1} of {steps.length}…
            </>
          ) : (
            <>
              <Play size={14} />
              Run Chain
            </>
          )}
        </button>
      </div>
    </div>
  );
}
