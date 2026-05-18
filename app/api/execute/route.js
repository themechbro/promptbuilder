import { NextResponse } from "next/server";

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
function validateRequest(provider, prompt, apiKey) {
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

  if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
    return "Prompt is required.";
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return `Prompt exceeds the maximum allowed length of ${MAX_PROMPT_LENGTH} characters.`;
  }

  return null;
}

/**
 * Shared HTTP error handler for provider API responses.
 * Catches non-OK responses that don't carry a structured error body.
 */
async function handleProviderResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.error ||
      `Provider returned HTTP ${response.status}`;
    throw new Error(message);
  }

  return data;
}

// --- GEMINI PIPELINE ---
async function callGemini(prompt, apiKey) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 },
      }),
    }
  );

  const data = await handleProviderResponse(response);

  return {
    output: data.candidates[0].content.parts[0].text,
    metrics: {
      inputTokens: data.usageMetadata.promptTokenCount,
      outputTokens: data.usageMetadata.candidatesTokenCount,
      totalTokens: data.usageMetadata.totalTokenCount,
    },
  };
}

// --- OPENAI PIPELINE ---
async function callOpenAI(prompt, apiKey) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    }),
  });

  const data = await handleProviderResponse(response);

  return {
    output: data.choices[0].message.content,
    metrics: {
      inputTokens: data.usage.prompt_tokens,
      outputTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    },
  };
}

// --- ANTHROPIC CLAUDE PIPELINE ---
async function callAnthropic(prompt, apiKey) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    }),
  });

  const data = await handleProviderResponse(response);

  return {
    output: data.content[0].text,
    metrics: {
      inputTokens: data.usage.input_tokens,
      outputTokens: data.usage.output_tokens,
      totalTokens: data.usage.input_tokens + data.usage.output_tokens,
    },
  };
}

// --- PROVIDER ROUTER ---
const PROVIDERS = {
  gemini: callGemini,
  openai: callOpenAI,
  anthropic: callAnthropic,
};

// --- MAIN HANDLER ---
export async function POST(request) {
  try {
    const { provider, prompt, apiKey } = await request.json();

    // Validate before touching any external API
    const validationError = validateRequest(provider, prompt, apiKey);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const callProvider = PROVIDERS[provider];
    const result = await callProvider(prompt.trim(), apiKey.trim());

    return NextResponse.json(result);
  } catch (error) {
    console.error("Proxy execution error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}