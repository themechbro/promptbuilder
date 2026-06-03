"use client";
import { useState, useEffect } from "react";
import { X, Loader2, ChevronDown } from "lucide-react";

const CATEGORIES = [
  "code-review",
  "writing",
  "analysis",
  "research",
  "debugging",
  "documentation",
  "planning",
  "data",
  "hr",
  "customer-support",
  "image-generation",
];

// Fetches components by type from existing API
function useComponents(type) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/components?type=${type}`)
      .then((r) => r.json())
      .then((d) => setData(d.components || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [type]);

  return { data, loading };
}

function ComponentSelect({ label, type, value, onChange }) {
  const { data, loading } = useComponents(type);
  const [open, setOpen] = useState(false);

  const selected = data.find((c) => c.id === value) || null;

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-left focus:outline-none focus:border-indigo-500 transition-colors"
      >
        {loading ? (
          <span className="text-gray-500 flex items-center gap-2">
            <Loader2 size={12} className="animate-spin" /> Loading…
          </span>
        ) : selected ? (
          <span className="text-white">{selected.name}</span>
        ) : (
          <span className="text-gray-500">Select {label.toLowerCase()}…</span>
        )}
        <ChevronDown size={14} className="text-gray-500 flex-shrink-0" />
      </button>

      {open && !loading && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-700 transition-colors"
          >
            None
          </button>
          {data.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onChange(c.id);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                value === c.id
                  ? "bg-indigo-600/20 text-indigo-300"
                  : "text-gray-200 hover:bg-gray-700"
              }`}
            >
              <span>{c.name}</span>
              <span className="text-gray-500 text-xs ml-2 font-mono">
                {c.slug}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CreatePackModal({
  onClose,
  onCreated,
  // Prefill props from /advanced
  prefillPersonaId = null,
  prefillProtocolId = null,
  prefillFormatId = null,
  prefillTemplateId = null,
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    slug: "",
    category: "",
    persona_id: prefillPersonaId,
    protocol_id: prefillProtocolId,
    format_id: prefillFormatId,
    template_id: prefillTemplateId,
    is_public: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function set(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-generate slug from name
      if (field === "name") {
        next.slug = value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");
      }
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    if (!form.protocol_id) {
      setError("At least one protocol is required.");
      setSaving(false);
      return;
    }

    const res = await fetch("/api/packs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        protocol_ids: form.protocol_id ? [form.protocol_id] : [],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to create pack.");
      setSaving(false);
      return;
    }

    onCreated?.(data.pack);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-white">Create Pack</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Bundle components into a reusable workflow
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
              Pack Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Code Review Expert"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
              Slug
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="auto-generated from name"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
              Description{" "}
              <span className="text-gray-600 normal-case font-normal">
                (optional)
              </span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What is this pack best used for?"
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="">Select a category…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace("-", " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Component Selectors */}
          <div className="border-t border-gray-800 pt-4 space-y-4">
            <p className="text-xs text-gray-500">Components</p>
            <ComponentSelect
              label="Persona"
              type="persona"
              value={form.persona_id}
              onChange={(v) => set("persona_id", v)}
            />
            <ComponentSelect
              label="Protocol *"
              type="protocol"
              value={form.protocol_id}
              onChange={(v) => set("protocol_id", v)}
            />
            <ComponentSelect
              label="Format"
              type="format"
              value={form.format_id}
              onChange={(v) => set("format_id", v)}
            />
            <ComponentSelect
              label="Template"
              type="template"
              value={form.template_id}
              onChange={(v) => set("template_id", v)}
            />
          </div>

          {/* is_public toggle */}
          <div className="flex items-center gap-3 pt-1">
            <div
              onClick={() => set("is_public", !form.is_public)}
              className={`w-10 h-5 rounded-full cursor-pointer transition-colors relative flex-shrink-0 ${
                form.is_public ? "bg-green-600" : "bg-gray-700"
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  form.is_public ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </div>
            <div>
              <span className="text-sm text-gray-300">
                {form.is_public ? "Public" : "Private"}
              </span>
              <p className="text-xs text-gray-600">
                {form.is_public
                  ? "Visible to all users in Community Hub"
                  : "Only visible to you"}
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.name || !form.category}
            className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium transition-colors text-sm"
          >
            {saving ? "Creating…" : "Create Pack"}
          </button>
        </div>
      </div>
    </div>
  );
}
