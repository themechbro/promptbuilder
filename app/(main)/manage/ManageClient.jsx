"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import EditComponentModal from "@/app/components/EditComponentModal";

const TYPE_ORDER = ["persona", "protocol", "format", "template", "taxonomy"];

const TYPE_COLORS = {
  persona: "text-purple-400 bg-purple-900/30 border-purple-800",
  protocol: "text-blue-400 bg-blue-900/30 border-blue-800",
  format: "text-green-400 bg-green-900/30 border-green-800",
  template: "text-orange-400 bg-orange-900/30 border-orange-800",
  taxonomy: "text-pink-400 bg-pink-900/30 border-pink-800",
};

export default function ManageClient() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [filter, setFilter] = useState("all");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  const fetchComponents = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("prompt_components")
      .select(
        "id, type, name, slug, version, content, metadata, is_public, created_at, updated_at",
      )
      .eq("created_by", user.id)
      .order("type", { ascending: true })
      .order("name", { ascending: true });

    if (!error) setComponents(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  async function handleDelete(id) {
    setDeleting(true);
    setDeleteError(null);

    const res = await fetch(`/api/components/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (res.ok) {
      setComponents((prev) => prev.filter((c) => c.id !== id));
      setDeleteTarget(null);
    } else {
      setDeleteError(data.error || "Delete failed. Try again.");
    }
    setDeleting(false);
  }

  function handleEditSave(updated) {
    setComponents((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c)),
    );
    setEditTarget(null);
  }

  const displayed =
    filter === "all" ? components : components.filter((c) => c.type === filter);

  const grouped = TYPE_ORDER.reduce((acc, type) => {
    const items = displayed.filter((c) => c.type === type);
    if (items.length) acc[type] = items;
    return acc;
  }, {});

  const countsByType = TYPE_ORDER.reduce((acc, type) => {
    acc[type] = components.filter((c) => c.type === type).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="border-b border-gray-800 px-8 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">My Vault</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {components.length} component{components.length !== 1 ? "s" : ""}
            </p>
          </div>
          <a
            href="/advanced"
            className="text-sm text-gray-400 hover:text-white transition-colors border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg"
          >
            Back to Studio
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-6">
        <div className="flex gap-2 mb-8 flex-wrap">
          <FilterTab
            label="All"
            count={components.length}
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          {TYPE_ORDER.filter((t) => countsByType[t] > 0).map((type) => (
            <FilterTab
              key={type}
              label={type}
              count={countsByType[type]}
              active={filter === type}
              onClick={() => setFilter(type)}
              colorClass={TYPE_COLORS[type]}
            />
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-gray-800/50 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : components.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-500">No components in your vault yet.</p>
            <a
              href="/advanced"
              className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
            >
              Go to Studio to create some â†’
            </a>
          </div>
        ) : (
          Object.entries(grouped).map(([type, items]) => (
            <section key={type} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`text-xs font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border ${TYPE_COLORS[type]}`}
                >
                  {type}
                </span>
                <span className="text-gray-600 text-xs">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((component) => (
                  <ComponentRow
                    key={component.id}
                    component={component}
                    onEdit={() => setEditTarget(component)}
                    onDelete={() => {
                      setDeleteError(null);
                      setDeleteTarget(component);
                    }}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {editTarget && (
        <EditComponentModal
          component={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleEditSave}
        />
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}
        >
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-1">
              Delete component?
            </h3>
            <p className="text-gray-400 text-sm mb-1">
              <span className="text-white font-medium">
                &quot;{deleteTarget.name}&quot;
              </span>{" "}
              will be permanently removed from the vault.
            </p>
            {deleteTarget.is_public && (
              <p className="text-yellow-500 text-xs mb-4">
                âš  This is a public component. Anyone using it in their prompts
                will lose it.
              </p>
            )}
            {!deleteTarget.is_public && <div className="mb-4" />}

            {deleteError && (
              <p className="text-red-400 text-sm mb-4">{deleteError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteError(null);
                }}
                className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget.id)}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-medium transition-colors text-sm"
              >
                {deleting ? "Deletingâ€¦" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterTab({ label, count, active, onClick, colorClass }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize flex items-center gap-1.5 ${
        active
          ? "bg-white text-gray-900"
          : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
      }`}
    >
      {label}
      <span className={`text-xs ${active ? "text-gray-500" : "text-gray-600"}`}>
        {count}
      </span>
    </button>
  );
}

function ComponentRow({ component, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors">
      <div
        className="flex items-center gap-4 px-4 py-3 cursor-pointer"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-medium truncate">
              {component.name}
            </span>
            <span className="text-gray-600 text-xs font-mono flex-shrink-0">
              v{component.version}
            </span>
            {component.is_public && (
              <span className="text-xs bg-green-900/30 text-green-500 border border-green-800 px-1.5 py-0.5 rounded-full flex-shrink-0">
                public
              </span>
            )}
          </div>
          <p className="text-gray-500 text-xs font-mono mt-0.5">
            {component.slug}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-xs px-3 py-1.5 rounded-lg border border-red-900/60 text-red-400 hover:bg-red-900/20 hover:border-red-700 transition-colors"
          >
            Delete
          </button>
          <span className="text-gray-600 text-sm ml-1">
            {expanded ? "â–²" : "â–¼"}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-800 pt-3">
          <p className="text-gray-400 text-xs font-mono leading-relaxed whitespace-pre-wrap">
            {component.content}
          </p>
          {component.metadata && Object.keys(component.metadata).length > 0 && (
            <div className="mt-3">
              <p className="text-gray-600 text-xs mb-1">Metadata</p>
              <pre className="text-gray-500 text-xs font-mono">
                {JSON.stringify(component.metadata, null, 2)}
              </pre>
            </div>
          )}
          <p className="text-gray-700 text-xs mt-3">
            Updated{" "}
            {new Date(component.updated_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      )}
    </div>
  );
}
