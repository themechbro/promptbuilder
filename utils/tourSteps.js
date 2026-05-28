/**
 * tourSteps.js
 * Defines the onboarding tour steps for Advanced Studio.
 * Each step targets a DOM element by ID.
 */

export const TOUR_STEPS = [
  {
    id: "welcome",
    target: null, // centered modal, no target element
    title: "Welcome to Advanced Studio",
    description:
      "Build structured, reusable prompts using a modular component system. This 60-second tour shows you how everything fits together.",
    position: "center",
  },
  {
    id: "architecture-layers",
    target: "tour-architecture-layers",
    title: "Architecture Layers",
    description:
      "Each prompt is built from 4 layers — Persona (who the AI is), Protocol (how it thinks), Format (how it responds), and Template (the task itself). Select one of each to compose your prompt.",
    position: "bottom",
  },
  {
    id: "new-component",
    target: "tour-new-component",
    title: "Create Components",
    description:
      "Build your own personas, protocols, formats and templates and save them to your personal vault. They'll be available for reuse across all your prompts.",
    position: "bottom",
  },
  {
    id: "task-template",
    target: "tour-task-template",
    title: "Task Template",
    description:
      "Write your task here. Use {{variable}} syntax for dynamic inputs — the studio detects them automatically and shows input fields below the editor.",
    position: "top",
  },
  {
    id: "compile-button",
    target: "tour-compile-button",
    title: "Compile Matrix",
    description:
      "Hit Compile to assemble all your layers into a structured prompt — a message array ready to send to any LLM. The output appears in the right panel.",
    position: "top",
  },
  {
    id: "output-tab",
    target: "tour-output-tab",
    title: "Output",
    description:
      "Your compiled prompt appears here as a structured message array with syntax highlighting. Copy it or download it as JSON.",
    position: "bottom",
  },
  {
    id: "run-tab",
    target: "tour-run-tab",
    title: "Run Live",
    description:
      "Switch to the RUN tab, add your Gemini, OpenAI or Anthropic API key, and execute the compiled prompt directly. Real token metrics included.",
    position: "bottom",
  },
  {
    id: "chain-tab",
    target: "tour-chain-tab",
    title: "Prompt Chaining",
    description:
      "The CHAIN tab lets you build multi-step pipelines. The output of each step feeds into the next via {{previous_output}} — turning a single prompt into a full reasoning workflow.",
    position: "bottom",
  },
  {
    id: "done",
    target: null, // centered modal, no target element
    title: "You're ready",
    description:
      "Start by selecting a Persona and writing a task template. Visit the Community Hub to discover ready-made Prompt Packs built by others.",
    position: "center",
  },
];

export const TOUR_STORAGE_KEY = (userId) => `tour_seen_${userId}`;
