"use client";

import { useState, useEffect } from "react";

// Hardcoded metadata catalog pointing to your public folder assets
const PACK_CATALOG = [
  {
    id: "dev_pack",
    icon: "💻",
    title: "Developer Pack",
    label: "API Designer & Code Architect",
    description: "Compiles strict protocol contracts and endpoint payload definitions with clear rate-limiting strategies.",
    path: "/packs/developer-pack.json"
  },
  {
    id: "hr_pack",
    icon: "👥",
    title: "HR & Ops Pack",
    label: "Technical Talent Aligner",
    description: "Generates hyper-tailored outreach loops and technical test criteria for specialized engineering candidates.",
    path: "/packs/hr-pack.json"
  },
  {
    id: "creator_pack",
    icon: "🎥",
    title: "Creator Pack",
    label: "Content Strategist",
    description: "Optimizes high-signal content matrices, tracking metadata, and titles focusing on premium rail networks.",
    path: "/packs/creator-pack.json"
  }, 
  {
    id: "pm_pack",
    icon: "📊",
    title: "Product Manager Pack",
    label: "Agile Spec Generator",
    description: "Transforms rough feature ideas into strict Agile user stories with Given/When/Then acceptance criteria.",
    path: "/packs/pm-pack.json"
  },
  {
    id: "marketing_pack",
    icon: "📈",
    title: "Marketing Pack",
    label: "SEO & Growth Outline",
    description: "Generates highly optimized SEO titles, meta descriptions, and structural blog outlines.",
    path: "/packs/marketing-pack.json"
  }
];

export default function CommunityHub({ onTemplatesUpdated }) {
  const [installedPacks, setInstalledPacks] = useState({});
  const [selectedPackData, setSelectedPackData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check which templates are already installed in localStorage
  const refreshInstalledStatus = () => {
    const saved = localStorage.getItem("prompt_builder_custom_templates");
    if (saved) {
      try {
        setInstalledPacks(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshInstalledStatus();
  }, []);

  const handlePreviewPack = async (packMeta) => {
    setIsLoading(true);
    try {
      const response = await fetch(packMeta.path);
      if (!response.ok) throw new Error("Failed to load pack data");
      const data = await response.json();
      setSelectedPackData({ ...data, _meta: packMeta });
      setIsModalOpen(true);
    } catch (error) {
      alert("Error loading template pack. Ensure the JSON file exists in public/packs/.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstallPack = (packData) => {
    const templateId = `custom_${packData.shortName.toLowerCase().replace(/\s+/g, "_")}`;
    
    const targetPayload = {
      ...packData,
      id: templateId,
      isCustom: true // Flags it with the amber badge in the studio
    };

    const existingCustom = JSON.parse(localStorage.getItem("prompt_builder_custom_templates") || "{}");
    const updatedCustom = { ...existingCustom, [templateId]: targetPayload };

    localStorage.setItem("prompt_builder_custom_templates", JSON.stringify(updatedCustom));
    
    refreshInstalledStatus();
    setIsModalOpen(false);
    
    alert(`Success: [${packData.label}] installed to your workspace!`);
    if (onTemplatesUpdated) onTemplatesUpdated();
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn relative">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <span>📦</span> Community Template Hub
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Browse and install pre-configured structural layouts. Installed packs will merge seamlessly with your own forged templates.
          </p>
        </div>

        {/* Marketplace Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PACK_CATALOG.map((pack) => {
            // Check if this pack's shortName exists in the installed registry
            const isInstalled = Object.values(installedPacks).some(
              (installed) => installed.shortName?.toLowerCase() === pack.title.toLowerCase() || installed.label?.toLowerCase() === pack.label.toLowerCase()
            );

            return (
              <div key={pack.id} className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex flex-col justify-between hover:border-indigo-500/50 transition-all group">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-3xl bg-slate-900 p-3 rounded-lg border border-slate-800">{pack.icon}</span>
                    {isInstalled && (
                      <span className="text-[10px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 px-2 py-1 rounded font-bold uppercase tracking-wide">
                        ✓ Installed
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">{pack.title}</h3>
                  <p className="text-[11px] text-indigo-400 font-mono mb-2">{pack.label}</p>
                  <p className="text-xs text-slate-400 line-clamp-3">{pack.description}</p>
                </div>
                
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handlePreviewPack(pack)}
                  className="mt-5 w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-bold py-2 rounded-lg transition-colors"
                >
                  Inspect Blueprint
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && selectedPackData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedPackData._meta.icon}</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-200 font-mono uppercase">{selectedPackData.shortName}</h3>
                  <p className="text-xs text-slate-400">{selectedPackData.label}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-rose-400 font-bold text-lg p-2 transition-colors">
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h4 className="text-[10px] uppercase font-mono text-slate-500 mb-1.5 font-bold tracking-wider">Blueprint Description</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{selectedPackData.description}</p>
              </div>

              <div>
                <h4 className="text-[10px] uppercase font-mono text-slate-500 mb-1.5 font-bold tracking-wider">Dynamic Variables ({selectedPackData.fields.length})</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedPackData.fields.map(f => (
                    <div key={f.id} className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg">
                      <code className="text-[10px] text-amber-400 font-bold block mb-1">{"{" + f.id + "}"}</code>
                      <span className="text-xs text-slate-400">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] uppercase font-mono text-slate-500 mb-1.5 font-bold tracking-wider">Raw Prompt Structure</h4>
                <pre className="bg-slate-950 border border-slate-800 p-4 rounded-lg text-[10px] font-mono text-emerald-400 whitespace-pre-wrap overflow-x-auto leading-loose">
                  {selectedPackData.prompt_template}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors">
                Cancel
              </button>
              <button 
                onClick={() => handleInstallPack(selectedPackData)}
                className="px-6 py-2 text-xs font-mono font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg transition-colors flex items-center gap-2"
              >
                📥 Install to Workspace
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}