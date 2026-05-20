"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileInput,
  GitBranch,
  ListChecks,
  PlayCircle,
  RotateCcw,
  Sparkles,
  TestTube2,
  X,
} from "lucide-react";

const workflows = [
  { id: "summarize", label: "Summarize" },
  { id: "extractData", label: "Extract" },
  { id: "analyze", label: "Analyze" },
  { id: "classify", label: "Classify" },
  { id: "write", label: "Draft" },
];

export default function QuickstartGuide({
  activeTab,
  activeCategory,
  hasWorkspaceValues,
  hasPrompt,
  hasChainBuffer,
  tokenCount,
  onOpenTemplate,
  onOpenSandbox,
  onSelectWorkflow,
  onResetWorkspace,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  const quickstartSteps = useMemo(() => [
    {
      title: "Pick a workflow",
      icon: ListChecks,
      detail: "Start with a template that matches the job: summarize, extract, analyze, classify, or draft.",
      done: activeTab === "template" && Boolean(activeCategory),
      actionLabel: "Open builder",
      action: onOpenTemplate,
    },
    {
      title: "Add inputs",
      icon: FileInput,
      detail: "Fill the fields, paste source text, or upload a PDF when the workflow supports it.",
      done: hasWorkspaceValues,
      actionLabel: hasWorkspaceValues ? "Reset values" : "Go to form",
      action: hasWorkspaceValues ? onResetWorkspace : onOpenTemplate,
    },
    {
      title: "Copy the prompt",
      icon: ClipboardCheck,
      detail: "Review the compiled prompt, then copy or export it when it looks right.",
      done: hasPrompt,
      actionLabel: "View prompt",
      action: onOpenTemplate,
    },
    {
      title: "Run a test",
      icon: TestTube2,
      detail: "Open the sandbox to send the prompt to one or more model providers.",
      done: activeTab === "sandbox",
      actionLabel: "Open sandbox",
      action: onOpenSandbox,
    },
    {
      title: "Chain the result",
      icon: GitBranch,
      detail: "Use a model response as the starting point for the next workflow.",
      done: hasChainBuffer,
      actionLabel: hasChainBuffer ? "Analyze result" : "Run first",
      action: hasChainBuffer ? () => {
        onOpenTemplate();
        onSelectWorkflow("analyze");
      } : onOpenSandbox,
    },
  ], [
    activeCategory,
    activeTab,
    hasChainBuffer,
    hasPrompt,
    hasWorkspaceValues,
    onOpenSandbox,
    onOpenTemplate,
    onResetWorkspace,
    onSelectWorkflow,
  ]);

  const completedCount = quickstartSteps.filter((step) => step.done).length;
  const progressPercent = Math.round((completedCount / quickstartSteps.length) * 100);
  const currentStep = quickstartSteps[activeStep];

  if (!isOpen) {
    return (
      <div className="flex w-full justify-end">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-sm font-medium text-slate-300 transition-all hover:border-white/20 hover:text-white"
        >
          <span className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4" aria-hidden="true" />
            Show quickstart
          </span>
        </button>
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Quickstart
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">A guided path through the workspace</h2>
          <p className="mt-1 text-sm text-slate-500">{completedCount} of {quickstartSteps.length} steps ready</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 w-36 overflow-hidden rounded-full border border-white/10 bg-[#0f172a]">
            <div className="h-full bg-cyan-300 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
          <button type="button" onClick={() => setIsOpen(false)} className="text-sm text-slate-500 transition-colors hover:text-slate-200" aria-label="Collapse quickstart">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-7">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
            {quickstartSteps.map((step, index) => (
              (() => {
                const Icon = step.icon;
                return (
              <button
                key={step.title}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`min-h-20 rounded-lg border p-3 text-left transition-all ${
                  activeStep === index
                    ? "border-cyan-300/40 bg-cyan-300/10"
                    : "border-white/10 bg-[#0f172a]/60 hover:border-white/20"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Step {index + 1}</span>
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                    step.done ? "bg-emerald-300/10 text-emerald-200" : "bg-white/[0.04] text-slate-600"
                  }`}>
                    {step.done ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
                  </span>
                </span>
                <span className={`mt-2 flex items-center gap-2 text-sm font-semibold ${activeStep === index ? "text-cyan-100" : "text-slate-300"}`}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {step.title}
                </span>
              </button>
                );
              })()
            ))}
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0f172a]/60 p-4">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step {activeStep + 1}</p>
                <h3 className="mt-1 text-base font-semibold text-white">{currentStep.title}</h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-400">{currentStep.detail}</p>
              </div>
              <button
                type="button"
                onClick={currentStep.action}
                className="rounded-lg border border-cyan-300/40 bg-cyan-300/15 px-3 py-2 text-sm font-semibold text-cyan-100 transition-all hover:bg-cyan-300/25"
              >
                <span className="flex items-center gap-2">
                  {currentStep.actionLabel === "Reset values" ? (
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  )}
                  {currentStep.actionLabel}
                </span>
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {workflows.map((workflow) => (
                <button
                  key={workflow.id}
                  type="button"
                  onClick={() => {
                    onOpenTemplate();
                    onSelectWorkflow(workflow.id);
                    setActiveStep(0);
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                    activeCategory === workflow.id
                      ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100"
                      : "border-white/10 bg-[#0b1020] text-slate-500 hover:border-white/20 hover:text-slate-300"
                  }`}
                >
                  {workflow.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 lg:col-span-5">
          <StatusCard label="View" value={activeTab} />
          <StatusCard label="Workflow" value={activeCategory || "None"} />
          <StatusCard label="Tokens" value={tokenCount || 0} tone="cyan" />
          <StatusCard label="Chain" value={hasChainBuffer ? "Ready" : "Empty"} tone={hasChainBuffer ? "green" : "muted"} />

          <div className="col-span-2 flex gap-2">
            <button
              type="button"
              disabled={activeStep === 0}
              onClick={() => setActiveStep((step) => Math.max(step - 1, 0))}
              className="flex-1 rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-sm font-medium text-slate-300 transition-all hover:border-white/20 disabled:cursor-not-allowed disabled:text-slate-700"
            >
              <span className="flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Previous
              </span>
            </button>
            <button
              type="button"
              disabled={activeStep === quickstartSteps.length - 1}
              onClick={() => setActiveStep((step) => Math.min(step + 1, quickstartSteps.length - 1))}
              className="flex-1 rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 text-sm font-medium text-slate-300 transition-all hover:border-white/20 disabled:cursor-not-allowed disabled:text-slate-700"
            >
              <span className="flex items-center justify-center gap-2">
                Next
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusCard({ label, value, tone = "default" }) {
  const toneClass = {
    cyan: "text-cyan-200",
    green: "text-emerald-200",
    muted: "text-slate-600",
    default: "text-slate-200",
  }[tone];

  return (
    <div className="rounded-lg border border-white/10 bg-[#0f172a]/70 p-3">
      <span className="block text-xs text-slate-500">{label}</span>
      <strong className={`mt-1 block truncate text-sm capitalize ${toneClass}`}>{value}</strong>
    </div>
  );
}
