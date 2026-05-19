"use client";

import { useState, useEffect } from "react";

export default function TemplateForge({ onTemplatesUpdated }) {
  const [shortName, setShortName] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [promptTemplate, setPromptTemplate] = useState("");
  const [systemRole, setSystemRole] = useState("Act as an expert in...");
const [objective, setObjective] = useState("Your task is to...");
  const [fields, setFields] = useState([
    { id: "content", label: "Source Material", type: "textarea", placeholder: "Default input content area..." }
  ]);

  const [customRegistry, setCustomRegistry] = useState({});
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);

  // Load custom templates locally to show dynamic eviction logs
  const loadActiveCustoms = () => {
    const saved = localStorage.getItem("prompt_builder_custom_templates");
    if (saved) {
      try { setCustomRegistry(JSON.parse(saved)); } catch (e) { console.error(e); }
    } else {
      setCustomRegistry({});
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadActiveCustoms();
  }, []);

  // ==========================================
  // FIXED V1.2.1: DETERMINISTIC LIVE AUTO-COMPILER
  // ==========================================
useEffect(() => {
  const dynamicVariableBlocks = fields
    .filter(f => f.id && f.id.trim() !== "")
    .map(f => {
      const blockHeader = (f.label && f.label.trim() !== "")
        ? f.label.toUpperCase()
        : f.id.toUpperCase();
      return `[${blockHeader}]\n{${f.id}}`;
    })
    .join("\n\n");

  const compiled = `[SYSTEM ROLE]
${systemRole}

[OBJECTIVE]
${objective}

${dynamicVariableBlocks}

[OUTPUT]:`;

  // eslint-disable-next-line react-hooks/set-state-in-effect
  setPromptTemplate(compiled);
}, [fields, systemRole, objective]);

  const handleAddField = () => {
    const uniqueId = `var_${crypto.randomUUID().split("-")[0]}`;
    setFields(prev => [...prev, { id: uniqueId, label: "Custom Parameter Field", type: "text", placeholder: "Enter user variables value..." }]);
  };

  const handleUpdateField = (index, key, val) => {
    let finalizedVal = val;
    if (key === "id") {
      // Enforce strict lowercase prompt token variable formatting rules safely
      finalizedVal = val.toLowerCase().replace(/[^a-z0-9_]/g, "");
    }
    setFields(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: finalizedVal };
      return updated;
    });
  };

  const handleRemoveField = (index) => {
    if (fields.length === 1) return;
    setFields(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleCompileAndSave = () => {
    if (!shortName || !label) {
      alert("Missing core identifying attributes: Short Tab Name and Full Engine Label are required.");
      return;
    }

    const sanitizedShortName = shortName.trim();
    const templateId = `custom_${sanitizedShortName.toLowerCase().replace(/\s+/g, "_")}`;
    
    const targetCustomPayload = {
    id: templateId,
    isCustom: true,
    shortName: sanitizedShortName,
    label: label.trim(),
    description: description.trim(),
    systemRole: systemRole.trim(),  // add this
    objective: objective.trim(),    // add this
    prompt_template: promptTemplate,
    fields: fields.map(f => ({ ...f, id: f.id.trim() }))
};

    const existingCustom = JSON.parse(localStorage.getItem("prompt_builder_custom_templates") || "{}");
    const updatedCustom = { ...existingCustom, [templateId]: targetCustomPayload };

    localStorage.setItem("prompt_builder_custom_templates", JSON.stringify(updatedCustom));
    
    // Clear form layout metadata parameters smoothly after commit
    setShortName("");
    setLabel("");
    setDescription("");
    setFields([{ id: "content", label: "Source Material", type: "textarea", placeholder: "Default input content area..." }]);
    setSystemRole("Act as an expert in...");
    setObjective("Your task is to...");
    
    loadActiveCustoms();
    alert(`Success: [${targetCustomPayload.label}] has been compiled and activated into your workspace layout tab configuration.`);
    if (onTemplatesUpdated) onTemplatesUpdated();
  };

  const handleDeleteCustomTemplate = (templateId) => {
    if (!confirm("Are you sure you want to permanently delete this custom template configuration from your workspace cache?")) return;

    const existingCustom = JSON.parse(localStorage.getItem("prompt_builder_custom_templates") || "{}");
    delete existingCustom[templateId];

    if (Object.keys(existingCustom).length === 0) {
      localStorage.removeItem("prompt_builder_custom_templates");
    } else {
      localStorage.setItem("prompt_builder_custom_templates", JSON.stringify(existingCustom));
    }

    loadActiveCustoms();
    alert("Template successfully removed from system disk configurations registry.");
    if (onTemplatesUpdated) onTemplatesUpdated();
  };

  const handleExportTemplate = () => {
    const exportPayload = {
      shortName: shortName || "Custom Template Spec",
      label: label || "User Contributed Module Blueprint",
      description,
      prompt_template: promptTemplate,
      fields
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${exportPayload.shortName.toLowerCase().replace(/\s+/g, "-")}-pack.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportTemplate = (e) => {
    setImportError("");
    setImportSuccess(false);
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.shortName || !parsed.label || !parsed.prompt_template || !parsed.fields) {
          throw new Error("Invalid schema blueprint configuration elements missing core layout fields structures mapping metrics.");
        }

        const templateId = `custom_${parsed.shortName.toLowerCase().replace(/\s+/g, "_")}`;
        const existingCustom = JSON.parse(localStorage.getItem("prompt_builder_custom_templates") || "{}");
        
        existingCustom[templateId] = { ...parsed, id: templateId, isCustom: true };

        localStorage.setItem("prompt_builder_custom_templates", JSON.stringify(existingCustom));
        setImportSuccess(true);
        loadActiveCustoms();
        if (onTemplatesUpdated) onTemplatesUpdated();
      } catch (err) {
        setImportError(err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 w-full animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        
        {/* Configuration Metadata Form Pane */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-2xl space-y-5 w-full">
          <div>
            <h3 className="text-sm font-bold font-mono text-amber-400 uppercase tracking-wider">🔨 Schema Authoring Canvas</h3>
            <p className="text-xs text-slate-400 mt-1">Design unlimited delimiter-enforced prompt blocks with dynamic variables</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Short Tab Name *</label>
              <input type="text" value={shortName} onChange={(e) => setShortName(e.target.value)} placeholder="e.g., QA Pack" className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded text-xs text-slate-300 font-mono focus:outline-none focus:border-amber-500" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Full Engine Label *</label>
              <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g., Automated Integration Compiler" className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded text-xs text-slate-300 focus:outline-none focus:border-amber-500" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Operational Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Explain the high-signal transformation target metrics..." className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded text-xs text-slate-300 focus:outline-none focus:border-amber-500" />
          </div>

<div className="space-y-1">
  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
    System Role *
  </label>
  <textarea
    rows={2}
    value={systemRole}
    onChange={(e) => setSystemRole(e.target.value)}
    placeholder="e.g., Act as a senior code reviewer specializing in security vulnerabilities..."
    className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded text-xs text-slate-300 font-mono focus:outline-none focus:border-amber-500"
  />
</div>

<div className="space-y-1">
  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
    Objective *
  </label>
  <textarea
    rows={2}
    value={objective}
    onChange={(e) => setObjective(e.target.value)}
    placeholder="e.g., Analyze the code below and identify all potential security risks..."
    className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded text-xs text-slate-300 font-mono focus:outline-none focus:border-amber-500"
  />
</div>

          {/* Dynamic Variable Rows Block */}
          <div className="space-y-3 border-t border-slate-800 pt-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wide">Form Field Variables Layer</h4>
                <p className="text-[10px] text-slate-500 font-sans mt-0.5">Define variable schemas on the fly to drive live compilation matrix blocks</p>
              </div>
              <button type="button" onClick={handleAddField} className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-1 rounded hover:bg-amber-500 hover:text-slate-950 transition-all font-mono font-bold">[+] Add Variable</button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {fields.map((field, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-850 p-3 rounded-lg grid grid-cols-12 gap-2 items-center relative group">
                  <div className="col-span-4 space-y-0.5">
                    <span className="text-[9px] font-mono font-bold text-slate-500 block">TOKEN ID (lowercase)</span>
                    <input type="text" value={field.id} onChange={(e) => handleUpdateField(idx, "id", e.target.value)} placeholder="e.g., content" className="w-full bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[11px] text-amber-400 font-mono focus:outline-none" />
                  </div>
                  <div className="col-span-5 space-y-0.5">
                    <span className="text-[9px] font-mono font-bold text-slate-500 block">INTERFACE CARD LABEL</span>
                    <input type="text" value={field.label} onChange={(e) => handleUpdateField(idx, "label", e.target.value)} placeholder="e.g., Source Code" className="w-full bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[11px] text-slate-300 focus:outline-none" />
                  </div>
                  <div className="col-span-3 space-y-0.5 relative">
                    <span className="text-[9px] font-mono font-bold text-slate-500 block">TYPE</span>
                    <select value={field.type} onChange={(e) => handleUpdateField(idx, "type", e.target.value)} className="w-full bg-slate-900 border border-slate-800 px-1 py-1 rounded text-[11px] text-slate-400 focus:outline-none font-mono">
                      <option value="text">text</option>
                      <option value="textarea">textarea</option>
                    </select>
                    {fields.length > 1 && (
                      <button type="button" onClick={() => handleRemoveField(idx)} className="absolute -top-1 -right-1 text-rose-500 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-bold">✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Blueprint Content Editor Grid Panel */}
        <div className="lg:col-span-6 space-y-6 w-full">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-2xl space-y-4 w-full">
            <div className="space-y-1">
              <label className="text-[11px] font-mono font-bold text-slate-400 uppercase block tracking-wider">Prompt Template Blueprint Base</label>
              <p className="text-[10px] text-slate-500 font-sans">Deterministic background rendering stream (Read Only Preview Container)</p>
            </div>
            
            <textarea 
              rows={16} 
              value={promptTemplate} 
              readOnly
              className="w-full bg-slate-950/80 border border-slate-850/60 rounded-lg p-4 font-mono text-xs text-emerald-400 select-all cursor-not-allowed leading-relaxed shadow-inner" 
              placeholder="System compilation tracking buffer..."
            />

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button type="button" onClick={handleCompileAndSave} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 border-amber-600 text-slate-950 font-mono font-bold py-2.5 rounded-lg text-xs tracking-wide shadow-lg uppercase transition-all">
                ⚡ Compile Forge Blueprint
              </button>
              <button type="button" onClick={handleExportTemplate} className="bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-mono font-bold py-2.5 rounded-lg text-xs uppercase transition-all">
                📥 Export JSON Pack
              </button>
            </div>
          </div>

          {/* JSON File Ingestion Component */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-2xl space-y-3 w-full">
            <div>
              <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wide">📦 Import Shared Custom Template Matrix</h4>
            </div>
            
            <div className="border border-dashed border-slate-800 bg-slate-950 p-4 rounded-lg text-center relative hover:border-slate-700 transition-colors">
              <input type="file" accept=".json" onChange={handleImportTemplate} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <span className="text-xs font-mono text-slate-500 block">Click or Drop `.json` Workflow Assets File Here</span>
            </div>

            {importSuccess && <p className="text-[11px] font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-900/60 p-2 rounded-md animate-fadeIn">✓ Schema mapping processed and committed to runtime storage matrix.</p>}
            {importError && <p className="text-[11px] font-mono text-rose-500 bg-rose-950/20 border border-rose-900/60 p-2 rounded-md animate-fadeIn">⚠️ Schema Mapping Failure: {importError}</p>}
          </div>
        </div>
      </div>

      {/* SECTION 3: Dynamic Management Inventory Registry List */}
      {Object.keys(customRegistry).length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-3 w-full animate-fadeIn">
          <div>
            <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">🗃️ Active User Custom Workflows Inventory</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Manage and evict compiled layout extensions resting inside local cluster nodes disk memory</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.values(customRegistry).map((item) => (
              <div key={item.id} className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl flex justify-between items-start gap-4">
                <div className="space-y-1 truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-900/60 text-amber-400 font-bold">Custom</span>
                    <h5 className="text-xs font-bold font-mono text-slate-300 truncate">{item.shortName}</h5>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans truncate">{item.label}</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{item.fields.length} dynamic variables initialized</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => handleDeleteCustomTemplate(item.id)}
                  className="text-[10px] font-mono bg-rose-950/20 hover:bg-rose-900 hover:text-white border border-rose-900/40 text-rose-400 px-2 py-1 rounded transition-all shrink-0 active:scale-95"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}