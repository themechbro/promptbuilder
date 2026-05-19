"use client";

import { useState } from "react";

export default function QuickstartGuide() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  const quickstartSteps = [
    {
      title: "1. Synthesize Template",
      icon: "📋",
      desc: "Select a target workflow from Step 1 (e.g., Extract Data or Analyze). Fill in your variables on the form, or drop a text-heavy PDF file into the edge parser to instantly auto-populate the main source material block."
    },
    {
      title: "2. Compile & Copy",
      icon: "⌨️",
      desc: "Press Ctrl + Enter (or Cmd + Enter on macOS). The system compiles your variables into a role-enforced structural prompt schema, evaluates your real-time input token weights, and auto-copies the output onto your system clipboard."
    },
    {
      title: "3. Run Live Sandbox",
      icon: "⚡",
      desc: "Toggle to the Interactive Live Sandbox. Tap 'Manage API Keys' to add your free Gemini token securely into session memory. Paste your structure, then hit Ctrl + Enter to stream concurrent responses across model grids."
    },
    {
      title: "4. Pipe the Step Chain",
      icon: "🔗",
      desc: "Once an execution run settles, switch workflows (e.g., from Extract to Analyze). A pulsing link icon labeled 'Link Upstream Output Data' will appear. Tap it to auto-inject the previous output directly into your next run."
    }
  ];

  if (!isOpen) {
    return (
      <div className="w-full flex justify-end">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="text-xs font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-all shadow-md"
        >
          📘 Show Quickstart Guide
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 animate-fadeIn">
      <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm">📘</span>
          <h3 className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-wider">
            Interactive System Quickstart Guide
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors"
        >
          [ Collapse ]
        </button>
      </div>

      {/* Horizontal Step Navigation Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-850">
        {quickstartSteps.map((step, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveStep(idx)}
            className={`px-3 py-2.5 rounded-md text-left transition-all flex flex-col gap-1 ${
              activeStep === idx
                ? "bg-slate-900 text-slate-200 shadow border border-slate-750"
                : "hover:bg-slate-900/40 text-slate-500 hover:text-slate-400"
            }`}
          >
            <span className="text-[11px] font-mono font-bold flex items-center gap-1.5">
              <span>{step.icon}</span>
              <span className={activeStep === idx ? "text-indigo-400" : ""}>{step.title.split(". ")[1]}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Active Onboarding Context Details Box */}
      <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl min-h-[80px] flex flex-col justify-center animate-fadeIn">
        <div className="flex items-start gap-3">
          <span className="text-xl bg-slate-900/80 border border-slate-800 p-2 rounded-lg shrink-0 select-none">
            {quickstartSteps[activeStep].icon}
          </span>
          <div className="space-y-1">
            <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wide">
              {quickstartSteps[activeStep].title}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              {quickstartSteps[activeStep].desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}