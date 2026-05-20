import { AlignLeft, CheckCircle2, ChevronDown, Type } from "lucide-react";

export default function PromptForm({ fields, values, onFieldChange }) {
  if (!fields || fields.length === 0) return null;

  return (
    <form onSubmit={(event) => event.preventDefault()} className="space-y-4">
      {fields.map((field) => {
        const id = field.id;
        const value = values[id] || "";
        const FieldIcon = field.type === "textarea" ? AlignLeft : field.type === "select" ? ChevronDown : Type;

        const selectedOption = field.options?.find((option) => (
          (typeof option === "object" ? option.value : option) === value
        ));
        const hintText = selectedOption?.hint;

        return (
          <div key={id} className="rounded-xl border border-white/10 bg-[#0f172a]/60 p-4">
            <label htmlFor={id} className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
              <FieldIcon className="h-4 w-4 text-cyan-300" aria-hidden="true" />
              {field.label}
              {field.required && (
                <span className="ml-auto flex items-center gap-1 text-xs text-cyan-300">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Required
                </span>
              )}
            </label>

            {field.type === "textarea" && (
              <textarea
                id={id}
                rows={7}
                value={value}
                placeholder={field.placeholder}
                required={field.required}
                onChange={(event) => onFieldChange(id, event.target.value)}
                className="w-full resize-y rounded-lg border border-white/10 bg-[#0b1020] px-3 py-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-300/60"
              />
            )}

            {field.type === "select" && (
              <div className="space-y-2">
                <select
                  id={id}
                  value={value}
                  required={field.required}
                  onChange={(event) => onFieldChange(id, event.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-lg border border-white/10 bg-[#0b1020] px-3 py-3 text-sm text-slate-100 outline-none transition-colors focus:border-cyan-300/60"
                >
                  <option value="" disabled hidden>Select an option...</option>
                  {field.options?.map((option) => {
                    const isObject = typeof option === "object" && option !== null;
                    const displayLabel = isObject ? option.label : option;
                    const dataValue = isObject ? option.value : option;

                    return (
                      <option key={dataValue} value={dataValue} className="bg-[#0b1020]">
                        {displayLabel}
                      </option>
                    );
                  })}
                </select>
                {hintText && <p className="text-xs leading-relaxed text-slate-500">{hintText}</p>}
              </div>
            )}

            {field.type === "text" && (
              <input
                id={id}
                type="text"
                value={value}
                placeholder={field.placeholder}
                required={field.required}
                onChange={(event) => onFieldChange(id, event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0b1020] px-3 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-colors focus:border-cyan-300/60"
              />
            )}
          </div>
        );
      })}
    </form>
  );
}
