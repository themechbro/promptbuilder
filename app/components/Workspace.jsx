"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import localforage from "localforage";
import {
  Boxes,
  CheckCircle2,
  Compass,
  FileText,
  GitBranch,
  History,
  Layers3,
  PenTool,
  RefreshCcw,
  Send,
  Sparkles,
  TestTube2,
  Trash2,
  Wrench,
} from "lucide-react";
import { templates, getAllTemplates } from "../data/templates";
import { buildPrompt } from "../data/utils/buildPrompt";
import { countTokens } from "../data/utils/countTokens";
import CategorySelector from "./CategorySelector";
import PromptForm from "./PromptForm";
import PromptOutput from "./PromptOutput";
import QuickstartGuide from "./QuickstartGuide";
import TemplateForge from "./TemplateForge";
import CommunityHub from "./CommunityHub";

const PdfUploader = dynamic(() => import("./PdfUploader"), {
  ssr: false,
  loading: () => (
    <div className="text-xs text-slate-500">Loading uploader...</div>
  ),
});

const navItems = [
  { id: "template", label: "Build", helper: "Templates", icon: Layers3 },
  { id: "sandbox", label: "Test", helper: "Models", icon: TestTube2 },
  { id: "forge", label: "Create", helper: "Custom", icon: PenTool },
  { id: "hub", label: "Explore", helper: "Community", icon: Compass },
];

const uploadEnabledCategories = new Set([
  "extractData",
  "summarize",
  "analyze",
  "resumeTailoring",
]);

export default function Workspace() {
  const [activeTab, setActiveTab] = useState("template");
  const [templatesRegistry, setTemplatesRegistry] = useState({});
  const [activeCategory, setActiveCategory] = useState("summarize");

  const [formValues, setFormValues] = useState({});
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [tokenCount, setTokenCount] = useState(0);
  const [rawContentTokens, setRawContentTokens] = useState(0);
  const [roughPrompt, setRoughPrompt] = useState("");
  const [roughTokenCount, setRoughTokenCount] = useState(0);
  const [history, setHistory] = useState([]);

  const [chainBuffer, setChainBuffer] = useState("");
  const [promptVersions, setPromptVersions] = useState({});

  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");

  const [historyQuery, setHistoryQuery] = useState("");

  const refreshTemplates = async () => {
    const templates = await getAllTemplates();
    setTemplatesRegistry(templates);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshTemplates();

    localforage.getItem("prompt_builder_history").then((savedHistory) => {
      if (savedHistory) {
        try {
          const parsed = typeof savedHistory === "string" ? JSON.parse(savedHistory) : savedHistory;
          setHistory(parsed);
        } catch (error) {
          console.error(error);
        }
      }
    });

    setGeminiKey(sessionStorage.getItem("sandbox_sk_gemini") || "");
    setOpenaiKey(sessionStorage.getItem("sandbox_sk_openai") || "");
    setAnthropicKey(sessionStorage.getItem("sandbox_sk_anthropic") || "");

    const handleSimulatedChain = (event) => setChainBuffer(event.detail);
    document.addEventListener("simulateChainBuffer", handleSimulatedChain);
    return () =>
      document.removeEventListener("simulateChainBuffer", handleSimulatedChain);
  }, []);

  const currentTemplate =
    templatesRegistry[activeCategory] ||
    templatesRegistry.summarize ||
    Object.values(templatesRegistry)[0];
  const chainTargetField =
    currentTemplate?.fields?.find((field) => field.id === "chain_context") ||
    currentTemplate?.fields?.find((field) => field.id === "content") ||
    currentTemplate?.fields?.find((field) => field.type === "textarea") ||
    currentTemplate?.fields?.find((field) =>
      /content|source|material|input|text|topic/i.test(
        `${field.id} ${field.label}`,
      ),
    ) ||
    currentTemplate?.fields?.find((field) => field.required) ||
    currentTemplate?.fields?.[0];
  const chainTargetValue = chainTargetField
    ? formValues[chainTargetField.id] || ""
    : "";
  const canLinkChainBuffer = Boolean(
    chainBuffer && chainTargetField && chainTargetValue !== chainBuffer,
  );
  const hasWorkspaceValues =
    Object.values(formValues).some(
      (value) => String(value || "").trim() !== "",
    ) || roughPrompt.trim() !== "";

  useEffect(() => {
    if (!activeCategory) return;
    setFormValues({});
    localforage.getItem(`form_cache_${activeCategory}`).then((savedForm) => {
      if (savedForm) {
        try {
          const parsed = typeof savedForm === "string" ? JSON.parse(savedForm) : savedForm;
          setFormValues(parsed);
        } catch (error) {
          console.error(error);
        }
      }
    });
  }, [activeCategory]);

  const handleFieldChange = (id, value) => {
    setFormValues((prev) => {
      const updated = { ...prev, [id]: value };
      localforage.setItem(
        `form_cache_${activeCategory}`,
        updated,
      );
      return updated;
    });
  };

  useEffect(() => {
    if (!currentTemplate) return;
    const compiled = buildPrompt(currentTemplate.prompt_template, formValues);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGeneratedPrompt(compiled);
    setTokenCount(countTokens(compiled));
    setRawContentTokens(countTokens(formValues.content || ""));
  }, [formValues, currentTemplate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRoughTokenCount(countTokens(roughPrompt));
  }, [roughPrompt]);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  // const handleSaveToHistory = (finalPrompt) => {
  //   if (!finalPrompt || finalPrompt.trim() === "" || !currentTemplate) return;

  //   setHistory((prev) => {
  //     if (prev[0]?.prompt === finalPrompt) return prev;
  //     const newEntry = {
  //       id: crypto.randomUUID(),
  //       category: currentTemplate.shortName,
  //       categoryId: activeCategory,
  //       prompt: finalPrompt,
  //       timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  //       formValues: { ...formValues },
  //     };
  //     const updated = [newEntry, ...prev].slice(0, 10);
  //     localStorage.setItem("prompt_builder_history", JSON.stringify(updated));
  //     return updated;
  //   });

  //   setPromptVersions((prev) => {
  //     const currentVersions = prev[activeCategory] || [];
  //     if (currentVersions[0] === finalPrompt) return prev;
  //     return { ...prev, [activeCategory]: [finalPrompt, ...currentVersions].slice(0, 3) };
  //   });
  // };

  const handleSaveToHistory = (finalPrompt, activeContext = "") => {
    if (!finalPrompt || finalPrompt.trim() === "" || !currentTemplate) return;

    setHistory((prev) => {
      // Check if the exact prompt run and chaining context match the last entry to prevent spam
      if (
        prev[0]?.prompt === finalPrompt &&
        prev[0]?.chainContext === (activeContext || chainBuffer)
      )
        return prev;

      const newEntry = {
        id: crypto.randomUUID(),
        category: currentTemplate.shortName,
        categoryId: activeCategory,
        prompt: finalPrompt,
        chainContext: activeContext || chainBuffer || "", // Captures the model outputs securely
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        formValues: { ...formValues },
      };

      // Increased to 25 items to provide a deeper search directory for the client loop
      const updated = [newEntry, ...prev].slice(0, 25);
      localforage.setItem("prompt_builder_history", updated);
      return updated;
    });

    setPromptVersions((prev) => {
      const currentVersions = prev[activeCategory] || [];
      if (currentVersions[0] === finalPrompt) return prev;
      return {
        ...prev,
        [activeCategory]: [finalPrompt, ...currentVersions].slice(0, 3),
      };
    });
  };

  const handleLoadHistoryItem = (item) => {
    setActiveCategory(item.categoryId);
    setTimeout(() => {
      setFormValues(item.formValues);
      localforage.setItem(
        `form_cache_${item.categoryId}`,
        item.formValues,
      );
    }, 50);
    setActiveTab("template");
  };

  const handleIngestChainBuffer = () => {
    if (!chainBuffer || !chainTargetField) return;
    handleFieldChange(chainTargetField.id, chainBuffer);
  };

  const handleResetWorkspace = () => {
    setFormValues({});
    setRoughPrompt("");
    localforage.removeItem(`form_cache_${activeCategory}`);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localforage.removeItem("prompt_builder_history");
  };

  const isJsonMode = formValues?.output_format === "Strict JSON Object";

  const renderPromptOutputContainer = () => (
    <PromptOutput
      prompt={generatedPrompt}
      isJsonMode={isJsonMode}
      tokenCount={tokenCount}
      rawContentTokens={rawContentTokens}
      roughPrompt={roughPrompt}
      setRoughPrompt={setRoughPrompt}
      roughTokenCount={roughTokenCount}
      onActionTriggered={() => handleSaveToHistory(generatedPrompt)}
      onPersistLocalHistory={(compiledPrompt, selectedModelOutput) =>
        handleSaveToHistory(compiledPrompt, selectedModelOutput)
      }
      activeTab={activeTab}
      setChainBuffer={setChainBuffer}
      versions={promptVersions[activeCategory] || []}
      onRestoreVersion={(restoredPrompt) => setGeneratedPrompt(restoredPrompt)}
      geminiKey={geminiKey}
      setGeminiKey={setGeminiKey}
      openaiKey={openaiKey}
      setOpenaiKey={setOpenaiKey}
      anthropicKey={anthropicKey}
      setAnthropicKey={setAnthropicKey}
    />
  );

  return (
    <div className="w-full space-y-5">
      <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`min-w-32 rounded-lg border px-4 py-3 text-left transition-all ${
                    isActive
                      ? "border-cyan-300/40 bg-cyan-300/10 text-white shadow-inner"
                      : "border-white/10 bg-[#0f172a]/70 text-slate-400 hover:border-white/20 hover:text-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </span>
                  <span className="mt-1 block pl-6 text-[11px] text-slate-500">
                    {item.helper}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 lg:min-w-[460px]">
            <div className="rounded-lg border border-white/10 bg-[#0f172a]/70 px-3 py-2">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Boxes className="h-3.5 w-3.5" aria-hidden="true" />
                Workflow
              </span>
              <strong className="mt-1 block truncate text-slate-200">
                {currentTemplate?.shortName || "None"}
              </strong>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#0f172a]/70 px-3 py-2">
              <span className="flex items-center gap-1.5 text-slate-500">
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                Prompt
              </span>
              <strong
                className={`mt-1 block ${generatedPrompt.trim() ? "text-cyan-200" : "text-slate-600"}`}
              >
                {generatedPrompt.trim() ? "Ready" : "Empty"}
              </strong>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#0f172a]/70 px-3 py-2">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Tokens
              </span>
              <strong className="mt-1 block text-slate-200">
                {tokenCount}
              </strong>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#0f172a]/70 px-3 py-2">
              <span className="flex items-center gap-1.5 text-slate-500">
                <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
                Chain
              </span>
              <strong
                className={`mt-1 block ${chainBuffer ? "text-emerald-300" : "text-slate-600"}`}
              >
                {chainBuffer ? "Ready" : "Empty"}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <QuickstartGuide
        activeTab={activeTab}
        activeCategory={activeCategory}
        hasWorkspaceValues={Boolean(hasWorkspaceValues)}
        hasPrompt={Boolean(generatedPrompt.trim())}
        hasChainBuffer={Boolean(chainBuffer)}
        tokenCount={tokenCount}
        onOpenTemplate={() => setActiveTab("template")}
        onOpenSandbox={() => setActiveTab("sandbox")}
        onSelectWorkflow={handleCategoryChange}
        onResetWorkspace={handleResetWorkspace}
      />

      {activeTab === "forge" ? (
        <TemplateForge onTemplatesUpdated={refreshTemplates} />
      ) : activeTab === "hub" ? (
        <CommunityHub onTemplatesUpdated={refreshTemplates} />
      ) : activeTab === "template" ? (
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
          <section className="space-y-5 lg:col-span-7">
            <section className="rounded-xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-cyan-300">
                    <Layers3 className="h-3.5 w-3.5" aria-hidden="true" />
                    Choose a workflow
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-white">
                    What do you want this prompt to do?
                  </h2>
                </div>
                <span className="hidden rounded-md border border-white/10 bg-[#0f172a] px-2.5 py-1 text-xs text-slate-500 sm:block">
                  Step 1
                </span>
              </div>
              <CategorySelector
                categories={Object.values(templatesRegistry)}
                activeId={activeCategory}
                onSelect={handleCategoryChange}
              />
            </section>

            {currentTemplate && (
              <section className="relative rounded-xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10">
                {canLinkChainBuffer && (
                  <div className="mb-4 rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="flex items-center gap-2 text-sm font-medium text-emerald-200">
                          <GitBranch className="h-4 w-4" aria-hidden="true" />
                          Upstream output is ready
                        </p>
                        <p className="mt-0.5 text-xs text-emerald-100/70">
                          Send the previous model result into{" "}
                          {chainTargetField?.label || "this workflow"}.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleIngestChainBuffer}
                        className="rounded-lg border border-emerald-300/40 bg-emerald-300/15 px-3 py-2 text-xs font-semibold text-emerald-100 transition-all hover:bg-emerald-300/25"
                      >
                        <span className="flex items-center gap-2">
                          <Send className="h-3.5 w-3.5" aria-hidden="true" />
                          {chainTargetValue ? "Replace field" : "Use output"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="max-w-2xl">
                    <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-cyan-300">
                      <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                      Fill the details
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-white">
                      {currentTemplate.label}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">
                      {currentTemplate.description}
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    {hasWorkspaceValues && (
                      <button
                        type="button"
                        onClick={handleResetWorkspace}
                        className="rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-xs font-semibold text-slate-400 transition-all hover:border-rose-400/40 hover:text-rose-200"
                      >
                        <span className="flex items-center gap-2">
                          <RefreshCcw
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                          Reset values
                        </span>
                      </button>
                    )}
                    {uploadEnabledCategories.has(activeCategory) ? (
                      <div className="w-full sm:w-[280px]">
                        <PdfUploader
                          key={activeCategory}
                          onTextExtracted={(markdown) =>
                            handleFieldChange("content", markdown)
                          }
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
                <PromptForm
                  fields={currentTemplate.fields}
                  values={formValues}
                  onFieldChange={handleFieldChange}
                />
              </section>
            )}

            {/* {history.length > 0 && (
              <section className="rounded-xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10">
                <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                      <History
                        className="h-4 w-4 text-cyan-300"
                        aria-hidden="true"
                      />
                      Recent prompts
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Click one to restore its workflow and values.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="self-start rounded-lg border border-white/10 bg-[#0f172a] px-3 py-1.5 text-xs font-semibold text-slate-500 transition-all hover:border-rose-400/40 hover:text-rose-200 sm:self-auto"
                  >
                    <span className="flex items-center gap-2">
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Delete history
                    </span>
                  </button>
                </div>
                <div className="space-y-2 overflow-y-auto pr-1 sm:max-h-56">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleLoadHistoryItem(item)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#0f172a]/70 px-3 py-2 text-left text-xs transition-all hover:border-cyan-300/30 hover:bg-[#111c33]"
                    >
                      <div className="min-w-0">
                        <span className="mb-1 inline-flex rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-200">
                          <CheckCircle2
                            className="mr-1 h-3 w-3"
                            aria-hidden="true"
                          />
                          {item.category}
                        </span>
                        <span className="block truncate text-slate-400">
                          {item.prompt.replace(/\[.*?\]/g, "").trim()}
                        </span>
                      </div>
                      <span className="shrink-0 text-[11px] text-slate-600">
                        {item.timestamp}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )} */}
            {history.length > 0 && (
              <section className="rounded-xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10">
                <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                      <History
                        className="h-4 w-4 text-cyan-300"
                        aria-hidden="true"
                      />
                      Recent prompts
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Click one to restore its workflow and values.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="self-start rounded-lg border border-white/10 bg-[#0f172a] px-3 py-1.5 text-xs font-semibold text-slate-500 transition-all hover:border-rose-400/40 hover:text-rose-200 sm:self-auto"
                  >
                    <span className="flex items-center gap-2">
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Delete history
                    </span>
                  </button>
                </div>

                {/* 🌟 1. Real-time Search Input using Workspace state */}
                <div className="mb-4 relative">
                  <input
                    type="text"
                    placeholder="Search past prompts or chain contexts..."
                    value={
                      roughPrompt /* Temporary hijacking or add a local state */
                    }
                    onChange={(e) => {
                      // Let's use a quick local state if you want, but for immediate testing,
                      // we will filter the array directly below using standard input handling.
                      window.historySearchQuery = e.target.value.toLowerCase();
                      setRoughPrompt(e.target.value); // Forces React to re-render the list dynamically
                    }}
                    className="w-full bg-[#0b1020] px-3 py-2 text-xs rounded-lg border border-white/10 text-white placeholder-slate-600 outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>

                {/* 🌟 2. The React-Filtered Array Map */}
                <div className="space-y-2 overflow-y-auto pr-1 sm:max-h-56">
                  {history
                    .filter((item) => {
                      const query = (
                        window.historySearchQuery || ""
                      ).toLowerCase();
                      if (!query) return true; // Show everything if search is empty

                      return (
                        item.prompt.toLowerCase().includes(query) ||
                        item.category.toLowerCase().includes(query) ||
                        (item.chainContext &&
                          item.chainContext.toLowerCase().includes(query))
                      );
                    })
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-1.5 rounded-lg border border-white/10 bg-[#0f172a]/70 p-2 transition-all hover:border-cyan-300/30"
                      >
                        <button
                          type="button"
                          onClick={() => handleLoadHistoryItem(item)}
                          className="flex w-full items-center justify-between gap-3 text-left text-xs"
                        >
                          <div className="min-w-0">
                            <span className="mb-1 inline-flex rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-200">
                              <CheckCircle2
                                className="mr-1 h-3 w-3"
                                aria-hidden="true"
                              />
                              {item.category}
                            </span>
                            <span className="block truncate text-slate-400">
                              {item.prompt.replace(/\[.*?\]/g, "").trim()}
                            </span>
                          </div>
                          <span className="shrink-0 text-[11px] text-slate-600">
                            {item.timestamp}
                          </span>
                        </button>

                        {item.chainContext && (
                          <div className="rounded border border-emerald-500/10 bg-emerald-950/20 p-1.5 text-[10px] text-emerald-300/80 font-mono truncate">
                            <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-400 block mb-0.5">
                              Saved Chain Node:
                            </span>
                            {item.chainContext}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </section>
            )}
          </section>

          <section className="lg:sticky lg:top-24 lg:col-span-5">
            {renderPromptOutputContainer()}
          </section>
        </div>
      ) : (
        <div className="w-full">{renderPromptOutputContainer()}</div>
      )}
    </div>
  );
}
