import { BarChart3, FileSearch, ListFilter, PenLine, ScanSearch, Trash2 } from "lucide-react";

const categoryIcons = {
  summarize: BarChart3,
  extractData: FileSearch,
  classify: ListFilter,
  write: PenLine,
  analyze: ScanSearch,
};

export default function CategorySelector({ categories, activeId, onSelect }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {categories.map((category) => {
        const isSelected = activeId === category.id;
        const Icon = categoryIcons[category.id] || ScanSearch;

        const handleInlineDelete = (event, templateId, shortName) => {
          event.stopPropagation();

          if (!confirm(`Delete the "${shortName}" custom template?`)) return;

          const existingCustom = JSON.parse(localStorage.getItem("prompt_builder_custom_templates") || "{}");
          delete existingCustom[templateId];

          if (Object.keys(existingCustom).length === 0) {
            localStorage.removeItem("prompt_builder_custom_templates");
          } else {
            localStorage.setItem("prompt_builder_custom_templates", JSON.stringify(existingCustom));
          }

          window.location.reload();
        };

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={`group flex min-h-28 w-full flex-col justify-between rounded-xl border p-4 text-left transition-all ${
              isSelected
                ? "border-cyan-300/40 bg-cyan-300/10 shadow-inner"
                : "border-white/10 bg-[#0f172a]/70 hover:border-white/20 hover:bg-[#111c33]"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <span className={`flex items-center gap-2 text-sm font-semibold ${isSelected ? "text-cyan-100" : "text-slate-200"}`}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {category.shortName}
                </span>
                {isSelected && <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.65)]" />}
              </div>
              <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">{category.label}</p>
            </div>

            {(category.isCustom || category.id.startsWith("custom_")) && (
              <button
                type="button"
                onClick={(event) => handleInlineDelete(event, category.id, category.shortName)}
                className="mt-3 w-fit rounded-md border border-rose-400/20 bg-rose-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-rose-200 opacity-80 transition-all hover:border-rose-300/40 hover:bg-rose-400/20"
              >
                <span className="flex items-center gap-1.5">
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                  Delete
                </span>
              </button>
            )}
          </button>
        );
      })}
    </div>
  );
}
