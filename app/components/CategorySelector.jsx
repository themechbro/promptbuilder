export default function CategorySelector({ categories, activeId, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      {categories.map((category) => {
        const isActive = category.id === activeId;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium border transition-all duration-200 flex flex-col justify-between h-20 ${
              isActive
                ? "bg-indigo-600/10 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/5"
                : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-slate-600 hover:text-slate-200"
            }`}
          >
            <span className="block font-mono tracking-wider uppercase opacity-60 text-[9px]">
              Workflow
            </span>
            
            {/* REMOVED 'truncate' and added layout breathing room */}
            <span className="font-semibold text-sm whitespace-normal leading-tight block mt-1">
              {category.shortName || category.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}