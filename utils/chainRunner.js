/**
 * chainRunner.js
 * Executes a linear prompt chain sequentially.
 * Each step's output becomes {{previous_output}} in the next step.
 */

import { compilePromptKitBlueprint } from "./promptCompiler";

/**
 * Compiles a single chain step into a message array.
 * Injects previous_output into the template variables.
 */

function compileStep(step, previousOutput = "") {
  const template = step.template
    ? { content: step.template.content }
    : { content: step.customTemplate || "" };

  const variables = {
    ...step.variables,
    previous_output: previousOutput,
  };

  return compilePromptKitBlueprint({
    persona: step.persona || null,
    protocol: step.protocol || null,
    format: step.format || null,
    template,
    variables,
  });
}

/**
 * Calls /api/execute for a single compiled message array.
 * Returns the full response text.
 */

async function executeMessages(messages, provider, apiKey, onChunk) {
  const response = await fetch("/api/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider, apiKey, messages }),
  });

  if (!response.ok) {
    const err = await response.json();

    if (response.status === 429) {
      const retryAfter = err.retryAfter || 60;
      throw new Error(
        `Rate limit hit — too many requests. Try again in ${retryAfter} seconds.`,
      );
    }

    throw new Error(err.error || "Execution failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  let metrics = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);

    if (chunk.includes("__STREAM_METRICS__")) {
      const parts = chunk.split("__STREAM_METRICS__");
      fullText += parts[0];
      try {
        metrics = JSON.parse(parts[1]);
      } catch {}
      onChunk?.(fullText);
    } else {
      fullText += chunk;
      onChunk?.(fullText);
    }
  }

  return { text: fullText, metrics };
}

/**
 * Runs the full chain sequentially.
 *
 * @param {Array} steps         - Array of step objects
 * @param {string} provider     - "gemini" | "openai" | "anthropic"
 * @param {string} apiKey       - API key for the selected provider
 * @param {Function} onStepStart(stepIndex) - called when a step begins
 * @param {Function} onStepChunk(stepIndex, text) - called on each streamed chunk
 * @param {Function} onStepComplete(stepIndex, result) - called when step finishes
 * @param {Function} onError(stepIndex, error) - called on failure
 *
 * @returns {Array} results - array of { stepIndex, output, metrics, compiledMessages }
 */

export async function runChain({
  steps,
  provider,
  apiKey,
  onStepStart,
  onStepChunk,
  onStepComplete,
  onError,
}) {
  if (!steps || steps.length === 0) throw new Error("No steps to run.");
  if (!apiKey?.trim()) throw new Error("API key is required.");

  const results = [];
  let previousOutput = "";

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

    try {
      onStepStart?.(i);

      const compiledMessages = compileStep(step, previousOutput);

      const { text, metrics } = await executeMessages(
        compiledMessages,
        provider,
        apiKey,
        (chunk) => onStepChunk?.(i, chunk),
      );

      const result = {
        stepIndex: i,
        output: text,
        metrics,
        compiledMessages,
      };

      results.push(result);
      previousOutput = text;
      onStepComplete?.(i, result);
    } catch (err) {
      onError?.(i, err);
      // Stop chain on error
      break;
    }
  }

  return results;
}

/**
 * Saves a chain to localForage.
 */
export async function saveChain(chain) {
  const localforage = (await import("localforage")).default;
  const existing = (await localforage.getItem("prompt_builder_chains")) || [];
  const index = existing.findIndex((c) => c.id === chain.id);

  if (index !== -1) {
    existing[index] = chain;
  } else {
    existing.unshift(chain);
  }

  const trimmed = existing.slice(0, 15); // max 15 saved chains
  await localforage.setItem("prompt_builder_chains", trimmed);
  return trimmed;
}

/**
 * Loads all saved chains from localForage.
 */
export async function loadChains() {
  const localforage = (await import("localforage")).default;
  return (await localforage.getItem("prompt_builder_chains")) || [];
}

/**
 * Deletes a chain by ID from localForage.
 */
export async function deleteChain(chainId) {
  const localforage = (await import("localforage")).default;
  const existing = (await localforage.getItem("prompt_builder_chains")) || [];
  const updated = existing.filter((c) => c.id !== chainId);
  await localforage.setItem("prompt_builder_chains", updated);
  return updated;
}

/**
 * Creates a blank step object with default values.
 */
export function createBlankStep(index) {
  return {
    id: crypto.randomUUID(),
    label: `Step ${index + 1}`,
    persona: null,
    protocol: null,
    format: null,
    template: null,
    customTemplate: "",
    variables: {},
  };
}
