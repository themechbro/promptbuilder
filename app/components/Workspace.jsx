"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { templates, getAllTemplates } from "../data/templates";
import { buildPrompt } from "../data/utils/buildPrompt";
import { countTokens } from "../data/utils/countTokens";
import CategorySelector from "./CategorySelector";
import PromptForm from "./PromptForm";
import PromptOutput from "./PromptOutput";
import DiagnosticTestHarness from "./DiagnosticTestHarness";
const PdfUploader = dynamic(() => import("./PdfUploader"), { 
  ssr: false,
  loading: () => <div className="text-xs font-mono text-slate-500 animate-pulse">Loading Pipeline...</div>
});
import QuickstartGuide from "./QuickstartGuide";
import TemplateForge from "./TemplateForge";
import CommunityHub from "./CommunityHub";

export default function Workspace() {
  // Core Application View Routing Tracking Layer
  const [activeTab, setActiveTab] = useState("template"); // "template" | "sandbox" | "forge"
  
  // Dynamic Template Schema Registries State Matrix
  const [templatesRegistry, setTemplatesRegistry] = useState({});
  const [activeCategory, setActiveCategory] = useState("summarize");
  
  const [formValues, setFormValues] = useState({});
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [tokenCount, setTokenCount] = useState(0);
  const [rawContentTokens, setRawContentTokens] = useState(0);
  const [roughPrompt, setRoughPrompt] = useState("");
  const [roughTokenCount, setRoughTokenCount] = useState(0);
  const [history, setHistory] = useState([]);

  // V1.1.0/V1.2.0 Pipeline Buffers
  const [chainBuffer, setChainBuffer] = useState(""); 
  const [promptVersions, setPromptVersions] = useState({}); 

  // Hoisted Transient Credentials Vault
  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");

  // 1. FEATURE: Hydrate Registry Dynamically from System + Disk Cache
  const refreshTemplates = () => {
    const hydratedTemplates = getAllTemplates();
    setTemplatesRegistry(hydratedTemplates);
  };

  // Run dynamic hydration on system mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshTemplates();

    const savedHistory = localStorage.getItem("prompt_builder_history");
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
    }
    
    setGeminiKey(sessionStorage.getItem("sandbox_sk_gemini") || "");
    setOpenaiKey(sessionStorage.getItem("sandbox_sk_openai") || "");
    setAnthropicKey(sessionStorage.getItem("sandbox_sk_anthropic") || "");

    const handleSimulatedChain = (e) => setChainBuffer(e.detail);
    document.addEventListener("simulateChainBuffer", handleSimulatedChain);
    return () => document.removeEventListener("simulateChainBuffer", handleSimulatedChain);
  }, []);

  // Safe fallback evaluator layer
  const currentTemplate = templatesRegistry[activeCategory] || templatesRegistry["summarize"] || Object.values(templatesRegistry)[0];

  // Form Caching Layer
  useEffect(() => {
    if (!activeCategory) return;
    const savedForm = localStorage.getItem(`form_cache_${activeCategory}`);
    if (savedForm) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      try { setFormValues(JSON.parse(savedForm)); return; } catch (e) { console.error(e); }
    }
    setFormValues({}); 
  }, [activeCategory]);

  const handleFieldChange = (id, val) => {
    setFormValues((prev) => {
      const updated = { ...prev, [id]: val };
      localStorage.setItem(`form_cache_${activeCategory}`, JSON.stringify(updated));
      return updated;
    });
  };

  // Compile prompt structures dynamically
  useEffect(() => {
    if (!currentTemplate) return;
    const compiled = buildPrompt(currentTemplate.prompt_template, formValues);
    setGeneratedPrompt(compiled);
    setTokenCount(countTokens(compiled));
    setRawContentTokens(countTokens(formValues["content"] || ""));
  }, [formValues, currentTemplate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRoughTokenCount(countTokens(roughPrompt));
  }, [roughPrompt]);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const handleSaveToHistory = (finalPrompt) => {
    if (!finalPrompt || finalPrompt.trim() === "" || !currentTemplate) return;

    setHistory((prev) => {
      if (prev[0]?.prompt === finalPrompt) return prev;
      const newEntry = {
        id: crypto.randomUUID(),
        category: currentTemplate.shortName,
        categoryId: activeCategory,
        prompt: finalPrompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        formValues: { ...formValues }
      };
      const updated = [newEntry, ...prev].slice(0, 10);
      localStorage.setItem("prompt_builder_history", JSON.stringify(updated));
      return updated;
    });

    setPromptVersions((prev) => {
      const currentVersions = prev[activeCategory] || [];
      if (currentVersions[0] === finalPrompt) return prev;
      const updatedVersions = [finalPrompt, ...currentVersions].slice(0, 3);
      return { ...prev, [activeCategory]: updatedVersions };
    });
  };

  const handleLoadHistoryItem = (item) => {
    setActiveCategory(item.categoryId);
    setTimeout(() => {
      setFormValues(item.formValues);
      localStorage.setItem(`form_cache_${item.categoryId}`, JSON.stringify(item.formValues));
    }, 50);
    setActiveTab("template"); 
  };

  const handleIngestChainBuffer = () => {
    if (!chainBuffer) return;
    handleFieldChange("content", chainBuffer);
  };

  const renderPromptOutputContainer = () => (
    <PromptOutput 
      prompt={generatedPrompt} 
      tokenCount={tokenCount} 
      rawContentTokens={rawContentTokens}
      roughPrompt={roughPrompt}
      setRoughPrompt={setRoughPrompt}
      roughTokenCount={roughTokenCount}
      onActionTriggered={() => handleSaveToHistory(generatedPrompt)}
      activeTab={activeTab}
      setChainBuffer={setChainBuffer}
      versions={promptVersions[activeCategory] || []}
      onRestoreVersion={(restoredPrompt) => setGeneratedPrompt(restoredPrompt)}
      geminiKey={geminiKey} setGeminiKey={setGeminiKey}
      openaiKey={openaiKey} setOpenaiKey={setOpenaiKey}
      anthropicKey={anthropicKey} setAnthropicKey={setAnthropicKey}
    />
  );

  return (
    <div className="w-full space-y-6">
      
      {/* 3-Tab Master Nav Header Route Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md gap-4 w-full">
        <div className="flex flex-wrap gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800/60">
          <button
            type="button"
            onClick={() => setActiveTab("template")}
            className={`px-4 py-2 text-xs font-mono rounded-md font-semibold transition-all ${
              activeTab === "template" ? "bg-slate-800 text-slate-200 shadow border border-slate-700" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            📋 Template Studio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sandbox")}
            className={`px-4 py-2 text-xs font-mono rounded-md font-semibold transition-all flex items-center gap-2 ${
              activeTab === "sandbox" ? "bg-slate-800 text-indigo-400 shadow border border-slate-700" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            ⚡ Interactive Sandbox
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("forge")}
            className={`px-4 py-2 text-xs font-mono rounded-md font-semibold transition-all flex items-center gap-2 ${
              activeTab === "forge" ? "bg-slate-800 text-amber-400 shadow border border-slate-700" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            🔨 Custom Template Forge
          </button>
          <button
          type="button"
          onClick={() => setActiveTab("hub")}
          className={`px-4 py-2 text-xs font-mono rounded-md font-semibold transition-all flex items-center gap-2 ${
          activeTab === "hub" ? "bg-slate-800 text-emerald-400 shadow border border-slate-700" : "text-slate-500 hover:text-slate-300"
  }`}
>
  📦 Community Hub
</button>
        </div>
        
        <div className="text-[11px] font-mono text-slate-500 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-850 self-end sm:self-auto">
          Status: <span className="text-emerald-400 font-bold">Dynamic Engine Layer Engaged</span>
        </div>
      </div>

      <QuickstartGuide />

      {/* ==========================================
          DYNAMIC 3-TAB RENDERING MULTIPLEXER
         ========================================== */}
      {activeTab === "forge" ? (
        /* Render New Authoring Zone */
        <TemplateForge onTemplatesUpdated={refreshTemplates} />
      ) : activeTab === "template" ? (
        /* Render Standard Studio Forms Split */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn w-full">
          <section className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
              <h2 className="text-sm font-semibold tracking-wider text-slate-400 uppercase mb-4 font-mono">Step 1: Select Workflow</h2>
              <CategorySelector categories={Object.values(templatesRegistry)} activeId={activeCategory} onSelect={handleCategoryChange} />
            </div>

            {currentTemplate && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative">
                {chainBuffer && !formValues["content"] && (
                  <div className="absolute top-4 right-6 animate-pulse z-10">
                    <button type="button" onClick={handleIngestChainBuffer} className="text-[10px] bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 px-2.5 py-1 rounded-md hover:bg-indigo-600 hover:text-white transition-all font-mono">
                      🔗 Link Upstream Output Data
                    </button>
                  </div>
                )}
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-medium text-slate-200">{currentTemplate.label}</h2>
                    <p className="text-sm text-slate-400 mt-1">{currentTemplate.description}</p>
                  </div>
                  {activeCategory === "extractData" || activeCategory === "summarize" || activeCategory === "analyze" ? (
                    <div className="w-full sm:w-auto sm:min-w-[260px]">
                      <PdfUploader key={activeCategory} onTextExtracted={(markdown) => handleFieldChange("content", markdown)} />
                    </div>
                  ) : null}
                </div>
                <PromptForm fields={currentTemplate.fields} values={formValues} onFieldChange={handleFieldChange} />
              </div>
            )}

            {history.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
                <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-3 font-mono">Recent Prompt Workbench History (Local Cache)</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {history.map((item) => (
                    <button key={item.id} onClick={() => handleLoadHistoryItem(item)} className="w-full text-left bg-slate-950 hover:bg-slate-800/60 border border-slate-800 px-3 py-2 rounded-lg text-xs flex justify-between items-center transition-all group font-mono">
                      <div className="flex items-center gap-2 truncate">
                        <span className="bg-indigo-950 text-indigo-400 border border-indigo-900 px-1.5 py-0.5 rounded text-[10px] font-bold">{item.category}</span>
                        <span className="text-slate-400 truncate group-hover:text-slate-200">{item.prompt.replace(/\[.*?\]/g, "").trim()}</span>
                      </div>
                      <span className="text-[10px] text-slate-600 font-sans shrink-0">{item.timestamp}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="lg:col-span-5 lg:sticky lg:top-24">
            {renderPromptOutputContainer()}
          </section>
        </div>
      ) : activeTab === "hub"? (<CommunityHub onTemplatesUpdated={refreshTemplates}/>):(
        /* Render Expanded Sandbox Playground Matrix */
        <div className="w-full animate-fadeIn">
          {renderPromptOutputContainer()}
        </div>
      )}
    </div>
  );
}