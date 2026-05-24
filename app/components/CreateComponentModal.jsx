"use client";
import { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";

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
      onClose();
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-200 font-mono">
              CREATE COMPONENT
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add a new PromptKit primitive to your vault
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-4 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
          {/* Type Selector */}
          <div>
            <label className="text-xs font-mono text-slate-400 mb-2 block">
              TYPE
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COMPONENT_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => handleChange("type", t)}
                  className={`px-3 py-2 rounded-lg text-xs font-mono border transition-all text-left ${
                    form.type === t
                      ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {TYPE_DESCRIPTIONS[form.type]}
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-mono text-slate-400 mb-2 block">
              NAME
            </label>
            <input
              type="text"
              placeholder="e.g. Principal Distributed Systems Architect"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
            />
            {form.name && (
              <p className="text-xs text-slate-600 mt-1 font-mono">
                slug:{" "}
                {form.name
                  .trim()
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")}
              </p>
            )}
          </div>

          {/* Version */}
          <div>
            <label className="text-xs font-mono text-slate-400 mb-2 block">
              VERSION
            </label>
            <input
              type="text"
              placeholder="1.0.0"
              value={form.version}
              onChange={(e) => handleChange("version", e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-xs font-mono text-slate-400 mb-2 block">
              CONTENT
            </label>
            <textarea
              placeholder="Write your prompt fragment here..."
              value={form.content}
              onChange={(e) => handleChange("content", e.target.value)}
              rows={6}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-sm font-mono focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Is Public Toggle */}
          <div className="flex items-center justify-between py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg">
            <div>
              <p className="text-xs font-mono text-slate-300">MAKE PUBLIC</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Share with the community hub
              </p>
            </div>
            <button
              onClick={() => handleChange("is_public", !form.is_public)}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                form.is_public ? "bg-indigo-600" : "bg-slate-700"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                  form.is_public ? "left-5" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            {loading ? "Creating..." : "Create Component"}
          </button>
        </div>
      </div>
    </div>
  );
}
