"use client";
import { useState } from "react";
import {
  Brain,
  GitBranch,
  LayoutTemplate,
  FileCode2,
  FolderTree,
  X,
  Plus,
  Loader2,
  Sparkles,
} from "lucide-react";
const COMPONENT_TYPES = [
  "persona",
  "protocol",
  "format",
  "taxonomy",
  "template",
];

const TYPE_DESCRIPTIONS = {
  persona: "Defines the AI's role, behavior and domain expertise",
  protocol: "Sets the reasoning style e.g. Chain-of-Thought, ReAct",
  format: "Controls the output structure e.g. JSON, Markdown",
  taxonomy: "Tags and labels for indexing and retrieval",
  template: "Reusable task structure with {{variable}} placeholders",
};

const TYPE_CONFIG = {
  persona: {
    icon: Brain,
    color: "text-violet-400",
    border: "border-violet-500/40",
    bg: "bg-violet-500/10",
    active: "bg-violet-500/15 border-violet-500/50 text-violet-300",
  },
  protocol: {
    icon: GitBranch,
    color: "text-blue-400",
    border: "border-blue-500/40",
    bg: "bg-blue-500/10",
    active: "bg-blue-500/15 border-blue-500/50 text-blue-300",
  },
  format: {
    icon: LayoutTemplate,
    color: "text-emerald-400",
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/10",
    active: "bg-emerald-500/15 border-emerald-500/50 text-emerald-300",
  },
  template: {
    icon: FileCode2,
    color: "text-amber-400",
    border: "border-amber-500/40",
    bg: "bg-amber-500/10",
    active: "bg-amber-500/15 border-amber-500/50 text-amber-300",
  },
  taxonomy: {
    icon: FolderTree,
    color: "text-pink-400",
    border: "border-pink-500/40",
    bg: "bg-pink-500/10",
    active: "bg-pink-500/15 border-pink-500/50 text-pink-300",
  },
};

export default function CreateComponentModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    type: "persona",
    content: "",
    version: "1.0.0",
    is_public: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [closing, setClosing] = useState(false);

  function handleClose() {
    setClosing(true);
    setTimeout(() => onClose(), 150); // matches animation duration
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/components", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create component.");
        return;
      }

      onCreated(data.component);
      handleClose();
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md ${
        closing ? "animate-modal-backdrop-out" : "animate-modal-backdrop-in"
      }`}
    >
      {" "}
      <div
        className={`bg-slate-950 border border-slate-800/80 rounded-2xl w-full max-w-lg mx-4 flex flex-col shadow-2xl shadow-black/50 ${
          closing ? "animate-modal-out" : "animate-modal-in"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25">
              <Sparkles size={15} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                New Component
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Add a primitive to your vault
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 flex flex-col gap-5 overflow-y-auto max-h-[70vh]">
          {/* Type Selector */}
          <div>
            <label className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-widest mb-2.5 block">
              Type
            </label>
            <div className="grid grid-cols-5 gap-2">
              {COMPONENT_TYPES.map((t) => {
                const config = TYPE_CONFIG[t];
                const Icon = config.icon;
                const isActive = form.type === t;
                return (
                  <button
                    key={t}
                    onClick={() => handleChange("type", t)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition-all duration-150 ${
                      isActive
                        ? config.active
                        : "bg-slate-900/60 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400"
                    }`}
                  >
                    <Icon
                      size={15}
                      className={isActive ? config.color : "text-slate-500"}
                    />
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wide">
                      {t}
                    </span>
                  </button>
                );
              })}
            </div>
            {form.type && (
              <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                {TYPE_DESCRIPTIONS[form.type]}
              </p>
            )}
          </div>

          {/* Name + Version row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-widest mb-2 block">
                Name
              </label>
              <input
                type="text"
                placeholder="e.g. Principal Systems Architect"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/60 focus:bg-slate-900 transition-all placeholder:text-slate-700"
              />
              {form.name && (
                <p className="text-[11px] text-slate-600 mt-1.5 font-mono truncate">
                  /
                  {form.name
                    .trim()
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "")}
                </p>
              )}
            </div>
            <div>
              <label className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-widest mb-2 block">
                Version
              </label>
              <input
                type="text"
                placeholder="1.0.0"
                value={form.version}
                onChange={(e) => handleChange("version", e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 text-sm font-mono focus:outline-none focus:border-indigo-500/60 focus:bg-slate-900 transition-all placeholder:text-slate-700"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-widest mb-2 block">
              Content
            </label>
            <textarea
              placeholder="Write your prompt fragment here..."
              value={form.content}
              onChange={(e) => handleChange("content", e.target.value)}
              rows={6}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 text-sm font-mono focus:outline-none focus:border-indigo-500/60 focus:bg-slate-900 transition-all resize-none leading-relaxed placeholder:text-slate-700"
            />
          </div>

          {/* Make Public */}
          <div
            onClick={() => handleChange("is_public", !form.is_public)}
            className={`flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition-all ${
              form.is_public
                ? "bg-green-500/8 border-green-500/25 hover:border-green-500/40"
                : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div>
              <p className="text-xs font-semibold text-slate-300">
                Make Public
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Visible in Community Hub to all users
              </p>
            </div>
            <div
              className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${
                form.is_public ? "bg-green-600" : "bg-slate-700"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  form.is_public ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/8 border border-red-500/25 rounded-xl px-4 py-3">
              <p className="text-xs text-red-400 font-mono">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800/80 flex items-center justify-end gap-2.5">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-500/20"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            {loading ? "Creating…" : "Create Component"}
          </button>
        </div>
      </div>
    </div>
  );
}
