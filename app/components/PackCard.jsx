"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck, Trash2, Zap, Users } from "lucide-react";

const CATEGORY_COLORS = {
  "code-review": "text-blue-400 bg-blue-900/30 border-blue-800",
  writing: "text-purple-400 bg-purple-900/30 border-purple-800",
  analysis: "text-yellow-400 bg-yellow-900/30 border-yellow-800",
  research: "text-green-400 bg-green-900/30 border-green-800",
  debugging: "text-red-400 bg-red-900/30 border-red-800",
  documentation: "text-orange-400 bg-orange-900/30 border-orange-800",
  planning: "text-cyan-400 bg-cyan-900/30 border-cyan-800",
  data: "text-pink-400 bg-pink-900/30 border-pink-800",
};

const TYPE_COLORS = {
  persona: "bg-purple-900/40 text-purple-300 border-purple-700/50",
  protocol: "bg-blue-900/40 text-blue-300 border-blue-700/50",
  format: "bg-green-900/40 text-green-300 border-green-700/50",
  template: "bg-orange-900/40 text-orange-300 border-orange-700/50",
};

export default function PackCard({ pack, onSaveToggle, onDelete }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isSaved, setIsSaved] = useState(pack.is_saved);
  const [useCount, setUseCount] = useState(pack.use_count);

  const categoryColor =
    CATEGORY_COLORS[pack.category] ||
    "text-slate-400 bg-slate-800 border-slate-700";

  async function handleLoad() {
    // Increment use_count
    try {
      await fetch(`/api/packs/${pack.id}/use`, { method: "POST" });
      setUseCount((c) => c + 1);
    } catch {
      // Non-fatal
    }

    // Build query params for /advanced
    const params = new URLSearchParams();
    if (pack.persona?.id) params.set("persona_id", pack.persona.id);
    if (pack.protocol_components?.[0]?.id)
      params.set("protocol_id", pack.protocol_components[0].id);
    if (pack.format?.id) params.set("format_id", pack.format.id);
    if (pack.template?.id) params.set("template_id", pack.template.id);
    params.set("pack_id", pack.id);

    router.push(`/advanced?${params.toString()}`);
  }

  async function handleSaveToggle() {
    setSaving(true);
    const method = isSaved ? "DELETE" : "POST";
    const res = await fetch(`/api/packs/${pack.id}/save`, { method });
    if (res.ok) {
      setIsSaved(!isSaved);
      onSaveToggle?.(pack.id, !isSaved);
    }
    setSaving(false);
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/packs/${pack.id}`, { method: "DELETE" });
    if (res.ok) {
      onDelete?.(pack.id);
    }
    setDeleting(false);
    setConfirmDelete(false);
  }

  const components = [
    pack.persona && { ...pack.persona, type: "persona" },
    ...(pack.protocol_components || []).map((p) => ({
      ...p,
      type: "protocol",
    })),
    pack.format && { ...pack.format, type: "format" },
    pack.template && { ...pack.template, type: "template" },
  ].filter(Boolean);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all flex flex-col gap-4">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-semibold text-sm">{pack.name}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${categoryColor}`}
            >
              {pack.category.replace("-", " ")}
            </span>
          </div>
          {pack.description && (
            <p className="text-gray-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
              {pack.description}
            </p>
          )}
        </div>

        {/* Use count */}
        <div className="flex items-center gap-1 text-gray-600 flex-shrink-0">
          <Users size={12} />
          <span className="text-xs">{useCount}</span>
        </div>
      </div>

      {/* Component tags */}
      {components.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {components.map((c) => (
            <span
              key={`${c.type}-${c.id}`}
              className={`text-xs px-2 py-0.5 rounded-md border font-mono ${
                TYPE_COLORS[c.type] ||
                "bg-gray-800 text-gray-400 border-gray-700"
              }`}
            >
              {c.name}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleLoad}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        >
          <Zap size={14} />
          Load in Studio
        </button>

        <button
          onClick={handleSaveToggle}
          disabled={saving}
          title={isSaved ? "Unsave" : "Save"}
          className={`p-2 rounded-lg border transition-colors ${
            isSaved
              ? "border-indigo-700 text-indigo-400 bg-indigo-900/30 hover:bg-indigo-900/50"
              : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
          }`}
        >
          {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>

        {pack.is_owner && !confirmDelete && (
          <button
            onClick={() => setConfirmDelete(true)}
            title="Delete pack"
            className="p-2 rounded-lg border border-gray-700 text-gray-500 hover:border-red-800 hover:text-red-400 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        )}

        {pack.is_owner && confirmDelete && (
          <div className="flex gap-1">
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-2 py-1.5 rounded-lg border border-gray-700 text-gray-400 text-xs hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-2 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              {deleting ? "…" : "Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
