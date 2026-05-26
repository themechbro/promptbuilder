"use client";

import { useState } from "react";

const TYPES = ["persona", "protocol", "format", "template", "taxonomy"];

export default function EditComponentModal({ component, onClose, onSave }) {
  const [form, setForm] = useState({
    type: component.type,
    name: component.name,
    slug: component.slug,
    version: component.version || "1.0.0",
    content: component.content,
    is_public: component.is_public,
    metadata: JSON.stringify(component.metadata || {}, null, 2),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const contentChanged = form.content.trim() !== component.content.trim();

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    let metadata;
    try {
      metadata = JSON.parse(form.metadata);
    } catch {
      setError("Metadata is not valid JSON. Fix it before saving.");
      setSaving(false);
      return;
    }

    const res = await fetch(`/api/components/${component.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, metadata }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Save failed. Try again.");
      setSaving(false);
      return;
    }

    onSave(data.component);
  }

  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-white">
              Edit Component
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">
              {component.slug}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Type + is_public row */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2.5 pb-2">
              <div
                onClick={() => set("is_public", !form.is_public)}
                className={`w-10 h-5 rounded-full cursor-pointer transition-colors relative ${
                  form.is_public ? "bg-green-600" : "bg-gray-700"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    form.is_public ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </div>
              <span className="text-sm text-gray-300">Public</span>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Slug + Version row */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                Slug
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="w-28">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                Version
              </label>
              <input
                type="text"
                value={form.version}
                onChange={(e) => set("version", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Content
              </label>
              {contentChanged && (
                <span className="text-xs text-yellow-400 flex items-center gap-1">
                  <span>⚡</span> Embedding will regenerate
                </span>
              )}
            </div>
            <textarea
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              rows={7}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500 transition-colors resize-y leading-relaxed"
            />
          </div>

          {/* Metadata */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
              Metadata{" "}
              <span className="text-gray-600 normal-case font-normal ml-1">
                (JSON)
              </span>
            </label>
            <textarea
              value={form.metadata}
              onChange={(e) => set("metadata", e.target.value)}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500 transition-colors resize-y"
            />
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
            disabled={saving}
            className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium transition-colors text-sm"
          >
            {saving
              ? contentChanged
                ? "Saving + embedding…"
                : "Saving…"
              : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
