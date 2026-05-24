"use client";
import { useEffect, useState } from "react";
import { X, Check, Loader2 } from "lucide-react";

export default function SelectComponentModal({ type, onClose, onSelect }) {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const response = await fetch(`/api/components?type=${type}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to fetch components.");
          return;
        }

        setComponents(data.components);
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchComponents();
  }, [type]);

  const handleSelect = () => {
    if (!selected) return;
    onSelect(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-200 font-mono">
              SELECT {type.toUpperCase()}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose a component from your vault
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* List */}
        <div className="px-6 py-4 flex flex-col gap-2 overflow-y-auto max-h-[60vh]">
          {loading && (
            <div className="flex items-center justify-center py-8 text-slate-500">
              <Loader2 size={18} className="animate-spin mr-2" />
              <span className="text-xs font-mono">Fetching components...</span>
            </div>
          )}

          {error && <p className="text-xs text-red-400 font-mono">{error}</p>}

          {!loading && !error && components.length === 0 && (
            <div className="text-center py-8">
              <p className="text-xs text-slate-500 font-mono">
                No {type} components found in your vault.
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Create one using the New Component button.
              </p>
            </div>
          )}

          {!loading &&
            components.map((component) => (
              <button
                key={component.id}
                onClick={() => setSelected(component)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selected?.id === component.id
                    ? "bg-indigo-600/20 border-indigo-500/50"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-200 font-medium">
                      {component.name}
                    </span>
                    {component.is_public && (
                      <span className="text-xs font-mono px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded">
                        public
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-600">
                      v{component.version}
                    </span>
                    {selected?.id === component.id && (
                      <Check size={14} className="text-indigo-400" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                  {component.content}
                </p>
              </button>
            ))}
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
            onClick={handleSelect}
            disabled={!selected}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
