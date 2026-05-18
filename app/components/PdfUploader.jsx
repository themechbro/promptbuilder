import { useState } from "react";
import { parsePdfToMarkdown } from "../data/utils/parsePdf";
export default function PdfUploader({ onTextExtracted }) {
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") return;

    setLoading(true);
    try {
      const markdown = await parsePdfToMarkdown(file);
      onTextExtracted(markdown);
    } catch (err) {
      alert("Error processing file. Ensure it is a standard non-scanned text PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
    <label className={`w-full h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 text-xs font-mono px-4 ${
      loading 
        ? "border-amber-500/50 bg-amber-500/5 text-amber-400 scale-[0.98]" 
        : "border-indigo-500/30 bg-slate-950/50 text-slate-400 hover:border-indigo-500/60 hover:bg-indigo-500/5 hover:text-indigo-300"
    }`}>
      <input 
        type="file" 
        accept=".pdf" 
        onChange={handleFileChange} 
        disabled={loading}
        className="hidden" 
      />
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold tracking-wide">Stripping Layout & Compressing...</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1 opacity-80">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <span className="font-semibold text-sm">Drop PDF Document</span>
          <span className="opacity-60 text-[10px]">Automatically converts to markdown (-Tokens)</span>
        </>
      )}
    </label>
  </div>
  );
}