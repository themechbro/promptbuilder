import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";
import { NextResponse } from "next/server";

export const runtime = "edge";

// Maximum prompt length to prevent API credit abuse
const MAX_PROMPT_LENGTH = 50000;

// Basic API key format validators per provider
const API_KEY_VALIDATORS = {
  gemini: (key) => key.length > 20,
  openai: (key) => key.startsWith("sk-"),
  anthropic: (key) => key.startsWith("sk-ant-"),
};

/**
 * Validates the incoming request payload before touching any external API.
 * Returns an error string if invalid, null if valid.
 */
// function validateRequest(provider, prompt, apiKey) {
//   if (!provider || typeof provider !== "string") {
//     return "Provider is required.";
//   }

//   if (!API_KEY_VALIDATORS[provider]) {
//     return `Unsupported provider: ${provider}`;
//   }

//   if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
//     return "API key is required.";
//   }

//   if (!API_KEY_VALIDATORS[provider](apiKey.trim())) {
//     return `Invalid API key format for provider: ${provider}`;
//   }

//   if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
//     return "Prompt is required.";
//   }

//   if (prompt.length > MAX_PROMPT_LENGTH) {
//     return `Prompt exceeds the maximum allowed length of ${MAX_PROMPT_LENGTH} characters.`;
//   }
//   if (
//     !messages &&
//     (!prompt || typeof prompt !== "string" || prompt.trim() === "")
//   ) {
//     return "Prompt is required.";
//   }
//   if (!messages && prompt.length > MAX_PROMPT_LENGTH) {
//     return `Prompt exceeds the maximum allowed length of ${MAX_PROMPT_LENGTH} characters.`;
//   }
//   return null;
// }

// --- MAIN HANDLER ---

function validateRequest(provider, prompt, apiKey, messages) {
  if (!provider || typeof provider !== "string") {
    return "Provider is required.";
  }

  if (!API_KEY_VALIDATORS[provider]) {
    return `Unsupported provider: ${provider}`;
  }

  if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
    return "API key is required.";
  }

  if (!API_KEY_VALIDATORS[provider](apiKey.trim())) {
    return `Invalid API key format for provider: ${provider}`;
  }

  // Accept either messages array or prompt string
  if (
    !messages &&
    (!prompt || typeof prompt !== "string" || prompt.trim() === "")
  ) {
    return "Prompt is required.";
  }

  if (!messages && prompt.length > MAX_PROMPT_LENGTH) {
    return `Prompt exceeds the maximum allowed length of ${MAX_PROMPT_LENGTH} characters.`;
  }

  return null;
}

// Add this function above the POST handler
function sanitizeMessages(messages) {
  return messages.map((m) => ({
    ...m,
    content: m.content
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, "-")
      .replace(/[\u2026]/g, "...")
      .replace(/[^\x00-\xFF]/g, ""),
  }));
}

export async function POST(request) {
  try {
    const { provider, prompt, apiKey, isJsonMode, messages } =
      await request.json();
    // Validate before touching any external API
    const validationError = validateRequest(provider, prompt, apiKey, messages);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    let model;
    if (provider === "gemini") {
      const google = createGoogleGenerativeAI({ apiKey });
      model = google("gemini-3.1-flash-lite");
    } else if (provider === "openai") {
      const openai = createOpenAI({ apiKey });
      model = openai("gpt-4o-mini");
    } else if (provider === "anthropic") {
      const anthropic = createAnthropic({ apiKey });
      model = anthropic("claude-haiku-4-5-20251001");
    } else {
      return NextResponse.json(
        { error: "Unsupported provider" },
        { status: 400 },
      );
    }
    const sanitizedMessages = messages ? sanitizeMessages(messages) : null;

    const result = streamText({
      model,
      ...(sanitizedMessages
        ? { messages: sanitizedMessages }
        : {
            system: isJsonMode
              ? "You must return your output as a valid JSON object..."
              : undefined,
            prompt: prompt.trim(),
          }),
      temperature: 0.2,
      maxTokens: 2000,
    });
    // Custom stream format: send text chunks, then a final special string with metrics
    // This allows the frontend to stay simple using native fetch without ai-sdk hooks
    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(encoder.encode(chunk));
          }
          const usage = await result.usage;
          console.log("AI SDK Usage Object:", usage); // <-- ADDED LOG
          const metricsStr = `\n\n__STREAM_METRICS__${JSON.stringify({
            inputTokens: usage?.promptTokens || usage?.inputTokens || 0,
            outputTokens: usage?.completionTokens || usage?.outputTokens || 0,
            totalTokens: usage?.totalTokens || 0,
          })}`;
          controller.enqueue(encoder.encode(metricsStr));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(customStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Proxy execution error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
