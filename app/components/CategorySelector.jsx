export default function CategorySelector({ categories, activeId, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      {categories.map((category) => {
  const isSelected = activeId === category.id;
  
  // Define a local click handler specifically to evict custom layouts safely
  const handleInlineDelete = (e, templateId, shortName) => {
    // CRITICAL: Stop the click event from bubbling up to the main select workflow button
    e.stopPropagation();

    if (!confirm(`Are you sure you want to permanently delete the [${shortName}] custom template from your workspace cache?`)) return;

    const existingCustom = JSON.parse(localStorage.getItem("prompt_builder_custom_templates") || "{}");
    delete existingCustom[templateId];

    if (Object.keys(existingCustom).length === 0) {
      localStorage.removeItem("prompt_builder_custom_templates");
    } else {
      localStorage.setItem("prompt_builder_custom_templates", JSON.stringify(existingCustom));
    }

    alert("Template successfully removed from system disk configurations registry.");
    
    // Force an application-wide storage context reload automatically
    if (window && typeof window.dispatchEvent === "function") {
      // Direct global dispatch handler to force Workspace.jsx to trigger its refresh hook
      window.location.reload(); 
    }
  };

  return (
    <button
      key={category.id}
      type="button"
      onClick={() => onSelect(category.id)}
      className={`w-full text-left p-3.5 rounded-xl border font-mono text-xs flex justify-between items-center transition-all ${
        isSelected
          ? "bg-slate-950 text-slate-200 border-slate-750 shadow-inner"
          : "bg-slate-900/40 text-slate-500 hover:text-slate-400 border-transparent"
      }`}
    >
      <div className="flex flex-col gap-0.5 truncate">
        <span className={`font-semibold tracking-wide ${isSelected ? "text-indigo-400" : "text-slate-400"}`}>
          {category.shortName}
        </span>
        <span className="text-[10px] text-slate-500 font-sans truncate max-w-[140px]">
          {category.label}
        </span>
      </div>

      {/* DYNAMIC RELATIVE HOVER OVERLAY BADGE */}
      {(category.isCustom || category.id.startsWith("custom_")) && (
        <div className="relative group/badge ml-2 shrink-0 select-none">
          
          {/* STATIC STATE: Shows standard Custom text pill by default */}
          <span className="text-[8px] tracking-wider uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950/50 border border-amber-900/60 text-amber-400 block group-hover/badge:opacity-0 transition-opacity duration-150">
            Custom
          </span>

          {/* HOVER STATE: Switches into a clickable absolute delete button anchor */}
          <button
            type="button"
            onClick={(e) => handleInlineDelete(e, category.id, category.shortName)}
            className="absolute inset-0 text-[8px] tracking-wider uppercase font-mono font-bold rounded bg-rose-950 border border-rose-900 text-rose-400 hover:bg-rose-900 hover:text-white transition-all opacity-0 group-hover/badge:opacity-100 flex items-center justify-center cursor-pointer shadow-md z-20"
            title="Delete Template"
          >
            ✕ Delete
          </button>
          
        </div>
      )}
    </button>
  );
})}
    </div>
  );
}