"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileJson,
  FileUp,
  Hammer,
  Info,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
  Type,
  Wrench,
} from "lucide-react";

const defaultField = {
  id: "content",
  label: "Source Material",
  type: "textarea",
  placeholder: "Paste the main input for this workflow...",
  required: true,
};

const defaultFields = [
  defaultField,
  {
    id: "chain_context",
    label: "Upstream Context",
    type: "textarea",
    placeholder: "Optional output from a previous step...",
    required: false,
  },
];

export default function TemplateForge({ onTemplatesUpdated }) {
  const [shortName, setShortName] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [promptTemplate, setPromptTemplate] = useState("");
  const [systemRole, setSystemRole] = useState("Act as an expert in...");
  const [objective, setObjective] = useState("Your task is to...");
  const [fields, setFields] = useState(defaultFields);

  const [customRegistry, setCustomRegistry] = useState({});
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);

  const loadActiveCustoms = () => {
    const saved = localStorage.getItem("prompt_builder_custom_templates");
    if (!saved) {
      setCustomRegistry({});
      return;
    }

    try {
      setCustomRegistry(JSON.parse(saved));
    } catch (error) {
      console.error(error);
      setCustomRegistry({});
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadActiveCustoms();
  }, []);

  useEffect(() => {
    const dynamicVariableBlocks = fields
      .filter((field) => field.id && field.id.trim() !== "")
      .map((field) => {
        const blockHeader = field.label && field.label.trim() !== ""
          ? field.label.toUpperCase()
          : field.id.toUpperCase();
        return `[${blockHeader}]\n{${field.id}}`;
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
    setFields((prev) => [
      ...prev,
      {
        id: uniqueId,
        label: "Custom input",
        type: "text",
        placeholder: "What should the user enter here?",
      },
    ]);
  };

  const handleUpdateField = (index, key, value) => {
    const finalizedValue = key === "id"
      ? value.toLowerCase().replace(/[^a-z0-9_]/g, "")
      : value;

    setFields((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: finalizedValue };
      return updated;
    });
  };

  const handleRemoveField = (index) => {
    if (fields.length === 1) return;
    setFields((prev) => prev.filter((_, idx) => idx !== index));
  };

  const resetForge = () => {
    setShortName("");
    setLabel("");
    setDescription("");
    setFields(defaultFields);
    setSystemRole("Act as an expert in...");
    setObjective("Your task is to...");
  };

  const handleCompileAndSave = () => {
    if (!shortName.trim() || !label.trim()) {
      alert("Please add a short name and a full workflow title before saving.");
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
      systemRole: systemRole.trim(),
      objective: objective.trim(),
      prompt_template: promptTemplate,
      fields: fields.map((field) => ({ ...field, id: field.id.trim() })),
    };

    const existingCustom = JSON.parse(localStorage.getItem("prompt_builder_custom_templates") || "{}");
    const updatedCustom = { ...existingCustom, [templateId]: targetCustomPayload };

    localStorage.setItem("prompt_builder_custom_templates", JSON.stringify(updatedCustom));
    resetForge();
    loadActiveCustoms();
    alert(`Saved "${targetCustomPayload.label}" to your workspace.`);
    if (onTemplatesUpdated) onTemplatesUpdated();
  };

  const handleDeleteCustomTemplate = (templateId) => {
    if (!confirm("Delete this custom template from your workspace?")) return;

    const existingCustom = JSON.parse(localStorage.getItem("prompt_builder_custom_templates") || "{}");
    delete existingCustom[templateId];

    if (Object.keys(existingCustom).length === 0) {
      localStorage.removeItem("prompt_builder_custom_templates");
    } else {
      localStorage.setItem("prompt_builder_custom_templates", JSON.stringify(existingCustom));
    }

    loadActiveCustoms();
    if (onTemplatesUpdated) onTemplatesUpdated();
  };

  const handleExportTemplate = () => {
    const exportPayload = {
      shortName: shortName || "Custom Template",
      label: label || "User Workflow",
      description,
      prompt_template: promptTemplate,
      fields,
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

  const handleImportTemplate = (event) => {
    setImportError("");
    setImportSuccess(false);
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      try {
        const parsed = JSON.parse(readerEvent.target.result);
        if (!parsed.shortName || !parsed.label || !parsed.prompt_template || !parsed.fields) {
          throw new Error("This JSON is missing shortName, label, prompt_template, or fields.");
        }

        const templateId = `custom_${parsed.shortName.toLowerCase().replace(/\s+/g, "_")}`;
        const existingCustom = JSON.parse(localStorage.getItem("prompt_builder_custom_templates") || "{}");

        existingCustom[templateId] = { ...parsed, id: templateId, isCustom: true };

        localStorage.setItem("prompt_builder_custom_templates", JSON.stringify(existingCustom));
        setImportSuccess(true);
        loadActiveCustoms();
        if (onTemplatesUpdated) onTemplatesUpdated();
      } catch (error) {
        setImportError(error.message);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <div className="w-full space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <section className="space-y-5 lg:col-span-6">
          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10">
            <div className="mb-5">
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-cyan-300">
                <Hammer className="h-3.5 w-3.5" aria-hidden="true" />
                Create custom
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">Build your own workflow template</h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
                Define the name, role, objective, and input fields. The prompt preview updates automatically as you edit.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldShell
                  label="Short name"
                  helper="This appears on the workflow card. Keep it brief, like QA Review or Blog SEO."
                  required
                >
                  <input
                    type="text"
                    value={shortName}
                    onChange={(event) => setShortName(event.target.value)}
                    placeholder="e.g., QA Review"
                    className="w-full rounded-lg border border-white/10 bg-[#0b1020] px-3 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-300/60"
                  />
                </FieldShell>

                <FieldShell
                  label="Workflow title"
                  helper="A clear title for what this template produces."
                  required
                >
                  <input
                    type="text"
                    value={label}
                    onChange={(event) => setLabel(event.target.value)}
                    placeholder="e.g., Security Review Assistant"
                    className="w-full rounded-lg border border-white/10 bg-[#0b1020] px-3 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-300/60"
                  />
                </FieldShell>
              </div>

              <FieldShell
                label="Description"
                helper="Explain when someone should use this workflow. This shows below the title."
              >
                <input
                  type="text"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="e.g., Reviews source code and lists security risks with fixes."
                  className="w-full rounded-lg border border-white/10 bg-[#0b1020] px-3 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-300/60"
                />
              </FieldShell>

              <FieldShell
                label="System role"
                helper="Tell the model what expert role to play. Be specific about domain and behavior."
                required
              >
                <textarea
                  rows={3}
                  value={systemRole}
                  onChange={(event) => setSystemRole(event.target.value)}
                  placeholder="e.g., Act as a senior security engineer reviewing production code."
                  className="w-full resize-y rounded-lg border border-white/10 bg-[#0b1020] px-3 py-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-300/60"
                />
              </FieldShell>

              <FieldShell
                label="Objective"
                helper="Describe the task the model should complete every time this workflow runs."
                required
              >
                <textarea
                  rows={3}
                  value={objective}
                  onChange={(event) => setObjective(event.target.value)}
                  placeholder="e.g., Identify security risks, explain impact, and recommend fixes."
                  className="w-full resize-y rounded-lg border border-white/10 bg-[#0b1020] px-3 py-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-300/60"
                />
              </FieldShell>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-cyan-300">
                  <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                  Input fields
                </p>
                <h3 className="mt-1 text-base font-semibold text-white">What should the user fill in?</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Each field becomes a variable in your prompt, such as {"{content}"} or {"{audience}"}.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddField}
                className="rounded-lg border border-cyan-300/40 bg-cyan-300/15 px-3 py-2 text-sm font-semibold text-cyan-100 transition-all hover:bg-cyan-300/25"
              >
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add field
                </span>
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={`${field.id}-${index}`} className="rounded-xl border border-white/10 bg-[#0f172a]/70 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                      <span className="text-sm font-semibold text-white">Field {index + 1}</span>
                    </div>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveField(index)}
                        className="rounded-lg border border-rose-300/20 bg-rose-300/10 p-2 text-rose-200 transition-all hover:bg-rose-300/20"
                        aria-label="Remove field"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                    <label className="space-y-1.5 sm:col-span-4">
                      <span className="text-xs font-medium text-slate-400">Variable ID</span>
                      <input
                        type="text"
                        value={field.id}
                        onChange={(event) => handleUpdateField(index, "id", event.target.value)}
                        placeholder="content"
                        className="w-full rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2 text-sm text-amber-200 placeholder:text-slate-600 outline-none focus:border-cyan-300/60"
                      />
                      <span className="block text-[11px] text-slate-600">Lowercase only. Used as {"{variable_id}"}.</span>
                    </label>

                    <label className="space-y-1.5 sm:col-span-5">
                      <span className="text-xs font-medium text-slate-400">Field label</span>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(event) => handleUpdateField(index, "label", event.target.value)}
                        placeholder="Source material"
                        className="w-full rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-300/60"
                      />
                      <span className="block text-[11px] text-slate-600">Shown above the input in the Build tab.</span>
                    </label>

                    <label className="space-y-1.5 sm:col-span-3">
                      <span className="text-xs font-medium text-slate-400">Input type</span>
                      <select
                        value={field.type}
                        onChange={(event) => handleUpdateField(index, "type", event.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/60"
                      >
                        <option value="text">Short text</option>
                        <option value="textarea">Long text</option>
                      </select>
                      <span className="block text-[11px] text-slate-600">Use long text for pasted content.</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-5 lg:col-span-6">
          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-cyan-300">
                  <FileJson className="h-3.5 w-3.5" aria-hidden="true" />
                  Live preview
                </p>
                <h3 className="mt-1 text-base font-semibold text-white">Generated prompt template</h3>
                <p className="mt-1 text-sm text-slate-500">This read-only preview is what gets saved to your workspace.</p>
              </div>
              <button
                type="button"
                onClick={resetForge}
                className="rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-sm font-semibold text-slate-400 transition-all hover:border-white/20 hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </span>
              </button>
            </div>

            <textarea
              rows={18}
              value={promptTemplate}
              readOnly
              className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-[#0b1020] p-4 font-mono text-xs leading-relaxed text-emerald-200 outline-none"
            />

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleCompileAndSave}
                className="rounded-lg border border-cyan-300/40 bg-cyan-300/15 px-4 py-3 text-sm font-semibold text-cyan-100 transition-all hover:bg-cyan-300/25"
              >
                <span className="flex items-center justify-center gap-2">
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Save template
                </span>
              </button>
              <button
                type="button"
                onClick={handleExportTemplate}
                className="rounded-lg border border-white/10 bg-[#0f172a] px-4 py-3 text-sm font-semibold text-slate-300 transition-all hover:border-white/20 hover:text-white"
              >
                <span className="flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Export JSON
                </span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10">
            <div className="mb-3">
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-cyan-300">
                <FileUp className="h-3.5 w-3.5" aria-hidden="true" />
                Import template
              </p>
              <h3 className="mt-1 text-base font-semibold text-white">Bring in a JSON workflow</h3>
              <p className="mt-1 text-sm text-slate-500">Import a pack exported from this tool or shared by someone else.</p>
            </div>

            <div className="relative rounded-xl border border-dashed border-white/10 bg-[#0f172a]/60 p-6 text-center transition-all hover:border-cyan-300/30">
              <input type="file" accept=".json" onChange={handleImportTemplate} className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" />
              <FileUp className="mx-auto mb-2 h-7 w-7 text-slate-500" aria-hidden="true" />
              <span className="block text-sm font-medium text-slate-300">Click to choose a JSON file</span>
              <span className="mt-1 block text-xs text-slate-600">The template will be added to your Build workflows.</span>
            </div>

            {importSuccess && (
              <p className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-200">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Template imported successfully.
              </p>
            )}
            {importError && (
              <p className="mt-3 flex items-center gap-2 rounded-lg border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-200">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {importError}
              </p>
            )}
          </div>

          <HelperPanel />
        </section>
      </div>

      {Object.keys(customRegistry).length > 0 && (
        <section className="rounded-xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10">
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-white">
              <Hammer className="h-4 w-4 text-cyan-300" aria-hidden="true" />
              Your custom workflows
            </h3>
            <p className="mt-1 text-sm text-slate-500">Manage templates saved in this browser.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Object.values(customRegistry).map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-[#0f172a]/70 p-4">
                <div className="min-w-0 space-y-1">
                  <span className="inline-flex rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-200">
                    Custom
                  </span>
                  <h4 className="truncate text-sm font-semibold text-white">{item.shortName}</h4>
                  <p className="truncate text-sm text-slate-500">{item.label}</p>
                  <p className="text-xs text-slate-600">{item.fields.length} fields</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteCustomTemplate(item.id)}
                  className="rounded-lg border border-rose-300/20 bg-rose-300/10 p-2 text-rose-200 transition-all hover:bg-rose-300/20"
                  aria-label={`Delete ${item.shortName}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function FieldShell({ label, helper, required = false, children }) {
  return (
    <label className="block rounded-xl border border-white/10 bg-[#0f172a]/70 p-4">
      <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-200">
        {label}
        {required && <span className="ml-auto text-xs font-medium text-cyan-300">Required</span>}
      </span>
      <span className="mb-3 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600" aria-hidden="true" />
        {helper}
      </span>
      {children}
    </label>
  );
}

function HelperPanel() {
  return (
    <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-cyan-100">
        <Info className="h-4 w-4" aria-hidden="true" />
        Template tips
      </h3>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-cyan-50/75">
        <p>Use the system role for expertise: who should the model act as?</p>
        <p>Use the objective for the repeatable task: what should the model do every time?</p>
        <p>Use fields for anything users should change between runs, like source text, audience, tone, or constraints.</p>
      </div>
    </div>
  );
}
