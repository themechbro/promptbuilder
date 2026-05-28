"use client";

import { useState, useEffect, useRef } from "react";
import { X, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { TOUR_STEPS, TOUR_STORAGE_KEY } from "../../utils/tourSteps";

function getTargetRect(targetId) {
  if (!targetId) return null;
  const el = document.getElementById(targetId);
  if (!el) return null;
  return el.getBoundingClientRect();
}

function TooltipBox({ step, stepIndex, total, onNext, onPrev, onSkip, rect }) {
  const isCenter = step.position === "center" || !rect;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === total - 1;

  // Calculate tooltip position relative to target
  let style = {};
  const TOOLTIP_WIDTH = 320;
  const TOOLTIP_OFFSET = 16;

  if (!isCenter && rect) {
    const top =
      step.position === "bottom"
        ? rect.bottom + TOOLTIP_OFFSET
        : rect.top - TOOLTIP_OFFSET;
    let left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;

    // Clamp to viewport
    left = Math.max(16, Math.min(left, window.innerWidth - TOOLTIP_WIDTH - 16));

    style = {
      position: "fixed",
      top: step.position === "bottom" ? top : "auto",
      bottom:
        step.position === "top"
          ? window.innerHeight - rect.top + TOOLTIP_OFFSET
          : "auto",
      left,
      width: TOOLTIP_WIDTH,
      zIndex: 9999,
    };
  }

  if (isCenter) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-modal-in">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25">
              <Sparkles size={16} className="text-indigo-400" />
            </div>
            <h3 className="text-base font-semibold text-white">{step.title}</h3>
          </div>

          <p className="text-sm text-gray-400 leading-relaxed mb-6">
            {step.description}
          </p>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mb-5">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === stepIndex
                    ? "w-5 bg-indigo-500"
                    : i < stepIndex
                      ? "w-2 bg-indigo-800"
                      : "w-2 bg-gray-700"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            {!isFirst && (
              <button
                onClick={onPrev}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 text-sm transition-all"
              >
                <ArrowLeft size={14} />
                Back
              </button>
            )}
            <button
              onClick={onSkip}
              className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
            >
              Skip tour
            </button>
            <button
              onClick={onNext}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-500/20"
            >
              {isLast ? "Get started" : "Next"}
              {!isLast && <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={style} className="animate-modal-in">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 shadow-2xl">
        {/* Arrow indicator */}
        {step.position === "bottom" && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 border-l border-t border-gray-700 rotate-45" />
        )}
        {step.position === "top" && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 border-r border-b border-gray-700 rotate-45" />
        )}

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono text-indigo-400 font-semibold uppercase tracking-widest">
            {stepIndex + 1} / {total}
          </span>
          <button
            onClick={onSkip}
            className="text-gray-600 hover:text-gray-400 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <h3 className="text-sm font-semibold text-white mb-1.5">
          {step.title}
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed mb-4">
          {step.description}
        </p>

        {/* Progress dots */}
        <div className="flex items-center gap-1 mb-3">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === stepIndex
                  ? "w-4 bg-indigo-500"
                  : i < stepIndex
                    ? "w-1.5 bg-indigo-800"
                    : "w-1.5 bg-gray-700"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {!isFirst && (
            <button
              onClick={onPrev}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white text-xs transition-all"
            >
              <ArrowLeft size={12} />
              Back
            </button>
          )}
          <button
            onClick={onNext}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-all"
          >
            {isLast ? "Done" : "Next"}
            {!isLast && <ArrowRight size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TourTooltip({ userId, onComplete }) {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const seen = localStorage.getItem(TOUR_STORAGE_KEY(userId));
    if (!seen) {
      // Small delay to let the page render fully
      setTimeout(() => setActive(true), 800);
    }
  }, [userId]);

  useEffect(() => {
    if (!active) return;
    const step = TOUR_STEPS[stepIndex];
    if (step.target) {
      const r = getTargetRect(step.target);
      setRect(r);

      // Scroll element into view if needed
      const el = document.getElementById(step.target);
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      setRect(null);
    }
  }, [stepIndex, active]);

  function completeTour() {
    localStorage.setItem(TOUR_STORAGE_KEY(userId), "true");
    setActive(false);
    onComplete?.();
  }

  function handleNext() {
    if (stepIndex < TOUR_STEPS.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      completeTour();
    }
  }

  function handlePrev() {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }

  if (!active) return null;

  const step = TOUR_STEPS[stepIndex];
  const isCenter = step.position === "center" || !rect;

  return (
    <>
      {/* Backdrop — dimmed for center steps, spotlight for targeted steps */}
      {isCenter ? (
        <div className="fixed inset-0 bg-black/70 z-[9998] backdrop-blur-sm" />
      ) : (
        <>
          {/* Dark overlay with cutout around target */}
          <div className="fixed inset-0 z-[9998] pointer-events-none">
            {rect && (
              <svg
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: "none" }}
              >
                <defs>
                  <mask id="spotlight-mask">
                    <rect width="100%" height="100%" fill="white" />
                    <rect
                      x={rect.left - 8}
                      y={rect.top - 8}
                      width={rect.width + 16}
                      height={rect.height + 16}
                      rx="12"
                      fill="black"
                    />
                  </mask>
                </defs>
                <rect
                  width="100%"
                  height="100%"
                  fill="rgba(0,0,0,0.7)"
                  mask="url(#spotlight-mask)"
                />
                {/* Highlight ring around target */}
                <rect
                  x={rect.left - 8}
                  y={rect.top - 8}
                  width={rect.width + 16}
                  height={rect.height + 16}
                  rx="12"
                  fill="none"
                  stroke="rgb(99,102,241)"
                  strokeWidth="2"
                  opacity="0.8"
                />
              </svg>
            )}
          </div>
        </>
      )}

      <TooltipBox
        step={step}
        stepIndex={stepIndex}
        total={TOUR_STEPS.length}
        onNext={handleNext}
        onPrev={handlePrev}
        onSkip={completeTour}
        rect={rect}
      />
    </>
  );
}
