"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
// import { templates } from "@/data/templates";
// import { buildPrompt } from "@/utils/buildPrompt";
// import { countTokens } from "@/utils/countTokens";
import { templates } from "../data/templates";
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

export default function Workspace() {
  const [activeCategory, setActiveCategory] = useState("summarize");
  const [formValues, setFormValues] = useState({});
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [tokenCount, setTokenCount] = useState(0);
  const [rawContentTokens, setRawContentTokens] = useState(0);
  const [roughPrompt, setRoughPrompt] = useState("");
  const [roughTokenCount, setRoughTokenCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("template"); 

  // V1.1.0 Usability States
  const [chainBuffer, setChainBuffer] = useState(""); 
  const [promptVersions, setPromptVersions] = useState({}); 

  // ==========================================
  // FIXED: HOISTED API CREDENTIAL STATE VAULT
  // ==========================================
  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");

// Add a safe fallback evaluation logic loop
const currentTemplate = templates[activeCategory] || templates["summarize"] || Object.values(templates)[0];

  // Testing
useEffect(() => {
    const handleSimulatedChain = (e) => {
      setChainBuffer(e.detail);
    };
    document.addEventListener("simulateChainBuffer", handleSimulatedChain);
    return () => document.removeEventListener("simulateChainBuffer", handleSimulatedChain);
  }, []);


  // Load history cache on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("prompt_builder_history");
    if (savedHistory) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      try { setHistory(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
    }
    
    // Secure Session Rehydration on Root Mount
    setGeminiKey(sessionStorage.getItem("sandbox_sk_gemini") || "");
    setOpenaiKey(sessionStorage.getItem("sandbox_sk_openai") || "");
    setAnthropicKey(sessionStorage.getItem("sandbox_sk_anthropic") || "");
  }, []);

  // Form State Persistence Loader
  useEffect(() => {
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

  useEffect(() => {
    const compiled = buildPrompt(currentTemplate.prompt_template, formValues);
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    if (!finalPrompt || finalPrompt.trim() === "") return;

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
      localStorage.setItem(`form_cache_${item.createdAt}`, JSON.stringify(item.formValues));
    }, 50);
    setActiveTab("template"); 
  };

  const handleIngestChainBuffer = () => {
    if (!chainBuffer) return;
    handleFieldChange("content", chainBuffer);
  };

  // Reusable Shared Sub-Component Injector to prevent duplicate runtime codes
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
      // Pass Hoisted Credentials & State Hooks Down Natively
      geminiKey={geminiKey} setGeminiKey={setGeminiKey}
      openaiKey={openaiKey} setOpenaiKey={setOpenaiKey}
      anthropicKey={anthropicKey} setAnthropicKey={setAnthropicKey}
    />
  );

  return (
    <div className="w-full space-y-6">
      
      {/* View Mode Switcher */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md">
        <div className="flex gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800/60">
          <button
            type="button"
            onClick={() => setActiveTab("template")}
            className={`px-4 py-2 text-xs font-mono rounded-md font-semibold transition-all ${
              activeTab === "template" ? "bg-slate-800 text-slate-200 shadow border border-slate-700" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            📋 Template Studio View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sandbox")}
            className={`px-4 py-2 text-xs font-mono rounded-md font-semibold transition-all flex items-center gap-2 ${
              activeTab === "sandbox" ? "bg-slate-800 text-indigo-400 shadow border border-slate-700" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            ⚡ Interactive Live Sandbox
          </button>
        </div>
        
        <div className="text-[11px] font-mono text-slate-500 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-850">
          Status: <span className="text-emerald-400 font-bold">Stateless Layer Engaged</span>
        </div>
      </div>

      {activeTab === "template" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
          <section className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
              <h2 className="text-sm font-semibold tracking-wider text-slate-400 uppercase mb-4 font-mono">Step 1: Select Workflow</h2>
              <CategorySelector categories={Object.values(templates)} activeId={activeCategory} onSelect={handleCategoryChange} />
            </div>

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
                <div className="w-full sm:w-auto sm:min-w-[260px]">
                  <PdfUploader key={activeCategory} onTextExtracted={(markdown) => handleFieldChange("content", markdown)} />
                </div>
              </div>
              <PromptForm fields={currentTemplate.fields} values={formValues} onFieldChange={handleFieldChange} />
            </div>

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
      ) : (
        <div className="w-full animate-fadeIn">
          {renderPromptOutputContainer()}
        </div>
      )}
  {/* AUTOMATION QA DISCOVERY TRAY */}
<div className="w-full pt-4 border-t border-slate-800/40">
  <DiagnosticTestHarness 
    activeTab={activeTab}
    setActiveTab={setActiveTab}
    activeCategory={activeCategory}
    onSimulateCategoryChange={handleCategoryChange}
    formValues={formValues}
    chainBuffer={chainBuffer}
    onSimulateFormInjected={(mockInputs, targetCategory) => {
      setFormValues(mockInputs);
      // Synchronously write directly to disk to clear out asynchronous batching failures
      localStorage.setItem(`form_cache_${targetCategory}`, JSON.stringify(mockInputs));
    }}
  />
</div>
  </div>
  );
}