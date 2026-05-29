"use client";
import { X, ArrowLeft } from "lucide-react";

const TYPE_COLORS = {
  persona: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  protocol: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  format: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  template: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

export default function ComponentPreviewModal({
  component,
  onClose,
  onSelect,
}) {
  const typeColor =
    TYPE_COLORS[component.type] ||
    "text-slate-400 bg-slate-500/10 border-slate-500/20";

  const handleSelect = () => {
    onSelect(component);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl mx-4 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-mono px-2 py-0.5 rounded border ${typeColor}`}
              >
                {component.type}
              </span>
              {component.is_public && (
                <span className="text-xs font-mono px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded border border-slate-700">
                  public
                </span>
              )}
              <span className="text-xs font-mono text-slate-600">
                v{component.version}
              </span>
            </div>
            <h2 className="text-sm font-semibold text-slate-100 font-mono">
              {component.name}
            </h2>
            {component.slug && (
              <p className="text-xs text-slate-600 font-mono">
                {component.slug}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors ml-4 shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
            {component.content}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex justify-between items-center shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <button
            onClick={handleSelect}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
