export default function PromptForm({ fields, values, onFieldChange }) {
  if (!fields || fields.length === 0) return null;

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
      {fields.map((field) => {
        const id = field.id;
        const value = values[id] || "";

        return (
          <div key={id} className="flex flex-col gap-1.5">
            <label 
              htmlFor={id} 
              className="text-xs font-semibold text-slate-300 flex items-center gap-1"
            >
              {field.label}
              {field.required && (
                <span className="text-rose-500 font-mono text-[10px]" title="Required field">*</span>
              )}
            </label>

            {/* Input Selection Strategy Engine */}
            {field.type === "textarea" && (
              <textarea
                id={id}
                rows={5}
                value={value}
                placeholder={field.placeholder}
                required={field.required}
                onChange={(e) => onFieldChange(id, e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors duration-150 resize-y"
              />
            )}

           {field.type === "select" && (() => {
  // Find the currently selected option object to extract its hint
  const selectedOptionObj = field.options?.find(opt => 
    (typeof opt === 'object' ? opt.value : opt) === value
  );
  const hintText = selectedOptionObj?.hint;

  return (
    <div className="flex flex-col gap-1">
      <select
        id={id}
        value={value}
        required={field.required}
        onChange={(e) => onFieldChange(id, e.target.value)}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors duration-150 appearance-none cursor-pointer"
      >
        <option value="" disabled hidden>Select option...</option>
        {field.options?.map((option) => {
          const isObj = typeof option === "object" && option !== null;
          const displayLabel = isObj ? option.label : option;
          const dataValue = isObj ? option.value : option;

          return (
            <option key={dataValue} value={dataValue} className="bg-slate-950">
              {displayLabel}
            </option>
          );
        })}
      </select>
      
      {/* NEW: Render the hint text subtly below the dropdown */}
      {hintText && (
        <p className="text-[10px] text-slate-500 font-medium tracking-wide">
          ↳ {hintText}
        </p>
      )}
    </div>
  );
})()}

            {field.type === "text" && (
              <input
                id={id}
                type="text"
                value={value}
                placeholder={field.placeholder}
                required={field.required}
                onChange={(e) => onFieldChange(id, e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors duration-150"
              />
            )}
          </div>
        );
      })}
    </form>
  );
}