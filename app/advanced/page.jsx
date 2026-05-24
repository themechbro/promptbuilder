"use client";

import { useState, useEffect } from "react";
import { compilePromptKitBlueprint } from "@/utils/promptCompiler";
import CreateComponentModal from "../components/CreateComponentModal";
import { Plus, Copy, Download, Check, ListRestart } from "lucide-react";
import SelectComponentModal from "../components/SelectComponentModal";
import localforage from "localforage";

export default function AdvancedStudio() {
  const [template, setTemplate] = useState("");
  const [variables, setVariables] = useState({});
  const [compiledOutput, setCompiledOutput] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Fallback testing states (We will link these to Supabase fetches later)
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const detectedVars = [
    ...new Set(
      [...template.matchAll(/{{([a-zA-Z0-9_-]+)}}/g)].map((m) => m[1]),
    ),
  ];
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectModal, setSelectModal] = useState(null); // stores active type e.g. "persona"
  const [activeRightTab, setActiveRightTab] = useState("output");
  const [history, setHistory] = useState([]);
  const [promptVersions, setPromptVersions] = useState({});

  const handleCompile = () => {
    try {
      setError(null);
      const payload = {
        persona: selectedPersona,
        protocol: selectedProtocol,
        format: selectedFormat,
        template: { content: template },
        variables: variables,
      };
      const result = compilePromptKitBlueprint(payload);
      setCompiledOutput(result);
      handleSaveToHistory(result); // add this
    } catch (err) {
      setError(err.message);
      setCompiledOutput(null);
    }
  };

  const handleComponentCreated = (component) => {
    console.log("Created:", component);
    // Will use this later when selector modal is built
  };

  const handleComponentSelected = (type, component) => {
    if (type === "persona") setSelectedPersona(component);
    if (type === "protocol") setSelectedProtocol(component);
    if (type === "format") setSelectedFormat(component);
    if (type === "template") {
      setSelectedTemplate(component);
      setTemplate(component.content); // auto-populate textarea
      setVariables({});
    }
  };

  // Add handlers
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(compiledOutput, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(compiledOutput, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compiled-blueprint.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToHistory = (compiledResult) => {
    if (!compiledResult || !selectedTemplate) return;

    setHistory((prev) => {
      const compiledString = JSON.stringify(compiledResult);

      // Prevent duplicate consecutive entries
      if (prev[0]?.prompt === compiledString) return prev;

      const newEntry = {
        id: crypto.randomUUID(),
        category: selectedTemplate.name,
        categoryId: selectedTemplate.slug,
        prompt: compiledString,
        chainContext: "",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        formValues: { ...variables },
        persona: selectedPersona?.name || null,
        protocol: selectedProtocol?.name || null,
        format: selectedFormat?.name || null,
      };

      const updated = [newEntry, ...prev].slice(0, 25);
      localforage.setItem("prompt_builder_advanced_history", updated);
      return updated;
    });

    setPromptVersions((prev) => {
      const slug = selectedTemplate.slug;
      const compiledString = JSON.stringify(compiledResult);
      const currentVersions = prev[slug] || [];
      if (currentVersions[0] === compiledString) return prev;
      return {
        ...prev,
        [slug]: [compiledString, ...currentVersions].slice(0, 3),
      };
    });
  };

  const handleReset = () => {
    setSelectedPersona(null);
    setSelectedProtocol(null);
    setSelectedFormat(null);
    setSelectedTemplate(null);
    setTemplate("");
    setVariables({});
    setCompiledOutput(null);
    setError(null);
  };

  useEffect(() => {
    localforage.getItem("prompt_builder_advanced_history").then((saved) => {
      if (saved) setHistory(saved);
    });
  }, []);

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 p-6 gap-6 h-[calc(100vh-69px)] overflow-hidden">
      {/* Left Column: Composable Matrix Inputs */}
      <div className="flex flex-col gap-4 overflow-y-auto pr-2">
        <div className="border border-slate-800 bg-slate-900/30 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-indigo-400">
              Architecture Layers
            </h2>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 transition-colors"
            >
              <ListRestart size={13} />
              Reset
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Select or attach your specialized infrastructure components.
          </p>

          {/* Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 transition-colors"
          >
            <Plus size={13} />
            New Component
          </button>

          {showCreateModal && (
            <CreateComponentModal
              onClose={() => setShowCreateModal(false)}
              onCreated={handleComponentCreated}
            />
          )}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {["persona", "protocol", "format", "template"].map((type) => {
              const selected =
                type === "persona"
                  ? selectedPersona
                  : type === "protocol"
                    ? selectedProtocol
                    : type === "format"
                      ? selectedFormat
                      : type === "template"
                        ? selectedTemplate
                        : null;

              return (
                <button
                  key={type}
                  onClick={() => setSelectModal(type)}
                  className={`p-3 border rounded-lg text-left text-sm transition-all ${
                    selected
                      ? "bg-indigo-600/10 border-indigo-500/40 hover:border-indigo-500/60"
                      : "bg-slate-900 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="text-xs text-slate-500 font-mono">
                    {type.toUpperCase()}
                  </div>
                  <div className="font-medium truncate text-slate-300 text-xs mt-1">
                    {selected ? selected.name : "None Selected"}
                  </div>
                </button>
              );
            })}
          </div>

          {selectModal && (
            <SelectComponentModal
              type={selectModal}
              onClose={() => setSelectModal(null)}
              onSelect={(component) => {
                handleComponentSelected(selectModal, component);
                setSelectModal(null);
              }}
            />
          )}
        </div>

        {/* Task Template Area */}
        <div className="flex-1 flex flex-col border border-slate-800 bg-slate-900/30 p-4 rounded-xl min-h-[300px]">
          <label className="text-sm font-semibold text-slate-300 mb-2 font-mono">
            TASK TEMPLATE
          </label>
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            placeholder="Write your task template here. Use double curly braces for variables, e.g., {{code_snippet}}"
            className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-indigo-500 resize-none"
          />
          {/* Detected Text */}
          {detectedVars.length > 0 && (
            <div className="mt-3 flex flex-col gap-2">
              <p className="text-xs text-slate-500 font-mono">
                DETECTED VARIABLES
              </p>
              {detectedVars.map((varName) => (
                <div key={varName} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-indigo-400 w-32 shrink-0">{`{{${varName}}}`}</span>
                  <input
                    type="text"
                    placeholder={`Enter value for ${varName}`}
                    value={variables[varName] ?? ""}
                    onChange={(e) =>
                      setVariables((prev) => ({
                        ...prev,
                        [varName]: e.target.value,
                      }))
                    }
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex justify-between items-center">
            {error && (
              <p className="text-xs text-red-400 font-mono max-w-[70%]">
                {error}
              </p>
            )}
            {!error && (
              <p className="text-xs text-slate-500 font-mono">
                Ready to compile local matrix.
              </p>
            )}
            <button
              onClick={handleCompile}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors ml-auto"
            >
              Compile Matrix
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: High-Fidelity Rendering & Output Sandbox */}
      {/* <div className="border border-slate-800 bg-slate-900/20 rounded-xl p-4 flex flex-col h-full overflow-hidden">
        <h2 className="text-sm font-semibold text-slate-300 mb-2 font-mono">
          COMPILED BLUEPRINT MESSAGE ARRAY
        </h2>

        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 overflow-y-auto font-mono text-xs text-slate-300">
          {compiledOutput ? (
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(compiledOutput, null, 2)}
            </pre>
          ) : (
            <div className="text-slate-600 h-full flex items-center justify-center italic">
              Input a template and hit Compile to generate payload context
            </div>
          )}
        </div>

        {compiledOutput && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 transition-colors"
            >
              {copied ? (
                <Check size={12} className="text-green-400" />
              ) : (
                <Copy size={12} />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 transition-colors"
            >
              <Download size={12} />
              JSON
            </button>
          </div>
        )}
      </div> */}

      {/* Right Column: Output + History Tabs */}
      <div className="border border-slate-800 bg-slate-900/20 rounded-xl p-4 flex flex-col h-full overflow-hidden">
        {/* Tab Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setActiveRightTab("output")}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                activeRightTab === "output"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              OUTPUT
            </button>
            <button
              onClick={() => setActiveRightTab("history")}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                activeRightTab === "history"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              HISTORY
              {history.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-slate-700 rounded text-xs">
                  {history.length}
                </span>
              )}
            </button>
          </div>

          {/* Copy + Download — only on output tab */}
          {activeRightTab === "output" && compiledOutput && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 transition-colors"
              >
                {copied ? (
                  <Check size={12} className="text-green-400" />
                ) : (
                  <Copy size={12} />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 transition-colors"
              >
                <Download size={12} />
                JSON
              </button>
            </div>
          )}
        </div>

        {/* Output Tab */}
        {activeRightTab === "output" && (
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 overflow-y-auto font-mono text-xs text-slate-300">
            {compiledOutput ? (
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(compiledOutput, null, 2)}
              </pre>
            ) : (
              <div className="text-slate-600 h-full flex items-center justify-center italic">
                Input a template and hit Compile to generate payload context
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeRightTab === "history" && (
          <div className="flex-1 overflow-y-auto flex flex-col gap-2">
            {history.length === 0 ? (
              <div className="text-slate-600 h-full flex items-center justify-center italic text-xs">
                No history yet. Compile a prompt to start.
              </div>
            ) : (
              history.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => {
                    setCompiledOutput(JSON.parse(entry.prompt));
                    setVariables(entry.formValues);
                    setActiveRightTab("output");
                  }}
                  className="w-full text-left p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-indigo-400 font-medium">
                      {entry.category}
                    </span>
                    <span className="text-xs text-slate-600 font-mono">
                      {entry.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {entry.persona && (
                      <span className="text-xs px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded font-mono">
                        {entry.persona}
                      </span>
                    )}
                    {entry.protocol && (
                      <span className="text-xs px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded font-mono">
                        {entry.protocol}
                      </span>
                    )}
                    {entry.format && (
                      <span className="text-xs px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded font-mono">
                        {entry.format}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
