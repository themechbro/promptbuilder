"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  Boxes,
  BriefcaseBusiness,
  Check,
  Code2,
  Database,
  Download,
  Eye,
  Film,
  LayoutGrid,
  Megaphone,
  Network,
  PackagePlus,
  Users,
  X,
} from "lucide-react";

const PACK_CATALOG = [
  {
    id: "dev_pack",
    icon: Code2,
    title: "Developer Pack",
    label: "API Designer & Code Architect",
    description: "Compile API contracts, endpoint payloads, and implementation notes with clearer technical constraints.",
    path: "/packs/developer-pack.json",
  },
  {
    id: "hr_pack",
    icon: Users,
    title: "HR & Ops Pack",
    label: "Technical Talent Aligner",
    description: "Create candidate outreach, interview criteria, and role-fit analysis for technical hiring workflows.",
    path: "/packs/hr-pack.json",
  },
  {
    id: "creator_pack",
    icon: Film,
    title: "Creator Pack",
    label: "Content Strategist",
    description: "Shape titles, outlines, metadata, and content plans for repeatable publishing workflows.",
    path: "/packs/creator-pack.json",
  },
  {
    id: "pm_pack",
    icon: LayoutGrid,
    title: "Product Manager Pack",
    label: "Agile Spec Generator",
    description: "Turn rough product ideas into user stories, acceptance criteria, and release-ready specs.",
    path: "/packs/pm-pack.json",
  },
  {
    id: "marketing_pack",
    icon: Megaphone,
    title: "Marketing Pack",
    label: "SEO & Growth Outline",
    description: "Generate SEO titles, meta descriptions, blog outlines, and campaign structure quickly.",
    path: "/packs/marketing-pack.json",
  },
  {
    id: "redisstrategist_pack",
    icon: Database,
    title: "Redis Strategist Pack",
    label: "Distributed Cache Planner",
    description: "Design Redis caching architectures, invalidation plans, and data access patterns.",
    path: "/packs/redis-pack.json",
  },
  {
    id: "feed_pack",
    icon: Network,
    title: "Feed Optimizer Pack",
    label: "Social Feed Architect",
    description: "Plan ranking, fanout, caching, and feed generation strategies for social products.",
    path: "/packs/feed-pack.json",
  },
  {
    id: "videostream_pack",
    icon: Film,
    title: "Streaming Engineer Pack",
    label: "Media Pipeline Architect",
    description: "Design HLS, CDN, transcoding, and adaptive delivery systems for video products.",
    path: "/packs/videostream-pack.json",
  },
  {
    id: "interview_pack",
    icon: BriefcaseBusiness,
    title: "Interview Forge Pack",
    label: "System Design Simulator",
    description: "Generate system design interview prompts, tradeoffs, and evaluation rubrics.",
    path: "/packs/interview-pack.json",
  },
  {
    id: "ai_pack",
    icon: Bot,
    title: "AI Workflow Pack",
    label: "LLM Pipeline Designer",
    description: "Design prompt chains, agent flows, evaluation plans, and structured AI workflows.",
    path: "/packs/aiworkflow-pack.json",
  },
];

export default function CommunityHub({ onTemplatesUpdated }) {
  const [installedPacks, setInstalledPacks] = useState({});
  const [selectedPackData, setSelectedPackData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const refreshInstalledStatus = () => {
    const saved = localStorage.getItem("prompt_builder_custom_templates");
    if (!saved) {
      setInstalledPacks({});
      return;
    }

    try {
      setInstalledPacks(JSON.parse(saved));
    } catch (error) {
      console.error(error);
      setInstalledPacks({});
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
      alert("Could not load this template pack. Check that the JSON file exists in public/packs.");
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
      isCustom: true,
    };

    const existingCustom = JSON.parse(localStorage.getItem("prompt_builder_custom_templates") || "{}");
    const updatedCustom = { ...existingCustom, [templateId]: targetPayload };
    localStorage.setItem("prompt_builder_custom_templates", JSON.stringify(updatedCustom));

    refreshInstalledStatus();
    setIsModalOpen(false);
    alert(`Installed "${packData.label}" to your workspace.`);
    if (onTemplatesUpdated) onTemplatesUpdated();
  };

  return (
    <div className="w-full space-y-5">
      <section className="rounded-xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-cyan-300">
              <Boxes className="h-3.5 w-3.5" aria-hidden="true" />
              Community hub
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">Install ready-made workflows</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
              Browse curated packs, preview the fields and prompt structure, then add useful templates to your Build tab.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#0f172a]/70 px-3 py-2 text-xs text-slate-400">
            {Object.keys(installedPacks).length} installed
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PACK_CATALOG.map((pack) => {
            const Icon = pack.icon;
            const isInstalled = Object.values(installedPacks).some(
              (installed) => installed.shortName?.toLowerCase() === pack.title.toLowerCase()
                || installed.label?.toLowerCase() === pack.label.toLowerCase()
            );

            return (
              <article
                key={pack.id}
                className="flex min-h-64 flex-col justify-between rounded-xl border border-white/10 bg-[#0f172a]/70 p-5 transition-all hover:border-cyan-300/30 hover:bg-[#111c33]"
              >
                <div>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    {isInstalled && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-[11px] font-semibold text-emerald-200">
                        <Check className="h-3 w-3" aria-hidden="true" />
                        Installed
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-white">{pack.title}</h3>
                  <p className="mt-1 text-xs font-medium text-cyan-300">{pack.label}</p>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-500">{pack.description}</p>
                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handlePreviewPack(pack)}
                  className="mt-5 rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2 text-sm font-semibold text-slate-300 transition-all hover:border-cyan-300/30 hover:text-cyan-100 disabled:cursor-wait disabled:text-slate-600"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    Preview pack
                  </span>
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {isModalOpen && selectedPackData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1020]/85 p-4 backdrop-blur-sm">
          <div className="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-[#0b1020]/60 p-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                  <selectedPackData._meta.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-white">{selectedPackData.shortName}</h3>
                  <p className="truncate text-sm text-slate-500">{selectedPackData.label}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-slate-500 transition-all hover:border-rose-300/30 hover:text-rose-200"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-5 overflow-y-auto p-5">
              <div className="rounded-xl border border-white/10 bg-[#0b1020]/60 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">What this pack does</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{selectedPackData.description}</p>
              </div>

              <div>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Form fields ({selectedPackData.fields.length})
                </h4>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {selectedPackData.fields.map((field) => (
                    <div key={field.id} className="rounded-lg border border-white/10 bg-[#0b1020]/60 p-3">
                      <code className="mb-1 block text-xs font-semibold text-amber-200">{"{" + field.id + "}"}</code>
                      <span className="text-sm text-slate-400">{field.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Prompt preview</h4>
                <pre className="max-h-72 overflow-auto rounded-xl border border-white/10 bg-[#0b1020] p-4 text-xs leading-relaxed whitespace-pre-wrap text-emerald-200">
                  {selectedPackData.prompt_template}
                </pre>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/10 bg-[#0b1020]/60 p-5">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-400 transition-all hover:border-white/20 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleInstallPack(selectedPackData)}
                className="rounded-lg border border-cyan-300/40 bg-cyan-300/15 px-4 py-2 text-sm font-semibold text-cyan-100 transition-all hover:bg-cyan-300/25"
              >
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Install to workspace
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
