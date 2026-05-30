import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const runtime = "edge";

const MAX_PROMPT_LENGTH = 50000;

const API_KEY_VALIDATORS = {
  gemini: (key) => key.length > 20,
  openai: (key) => key.startsWith("sk-"),
  anthropic: (key) => key.startsWith("sk-ant-"),
};

// --- UPSTASH REDIS CLIENT ---
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// --- RATE LIMITERS ---

// Layer 1 — Per IP: 15 requests per 60 seconds
const ipRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(15, "60 s"),
  prefix: "pb:rl:ip",
  analytics: true,
});

// Layer 2 — Per API key hash: 25 requests per 60 seconds
const keyRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(25, "60 s"),
  prefix: "pb:rl:key",
  analytics: true,
});

// --- HELPERS ---

// Edge-compatible SHA-256 hash — never store raw API keys in Redis
async function hashApiKey(apiKey) {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey.trim());
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16); // 16 chars — enough for a unique Redis key
}

// Extract real IP from edge request headers
function getClientIP(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous"
  );
}

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

// --- MAIN HANDLER ---

export async function POST(request) {
  try {
    const { provider, prompt, apiKey, isJsonMode, messages } =
      await request.json();

    // Validate payload before touching rate limiters or external APIs
    const validationError = validateRequest(provider, prompt, apiKey, messages);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // --- LAYER 1: IP RATE LIMIT ---
    const ip = getClientIP(request);
    const {
      success: ipAllowed,
      limit: ipLimit,
      remaining: ipRemaining,
      reset: ipReset,
    } = await ipRatelimit.limit(ip);

    if (!ipAllowed) {
      return NextResponse.json(
        {
          error: "Too many requests from your network. Try again in a moment.",
          retryAfter: Math.ceil((ipReset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((ipReset - Date.now()) / 1000)),
            "X-RateLimit-Limit-IP": String(ipLimit),
            "X-RateLimit-Remaining-IP": String(ipRemaining),
          },
        },
      );
    }

    // --- LAYER 2: API KEY HASH RATE LIMIT ---
    const keyHash = await hashApiKey(apiKey);
    const {
      success: keyAllowed,
      limit: keyLimit,
      remaining: keyRemaining,
      reset: keyReset,
    } = await keyRatelimit.limit(keyHash);

    if (!keyAllowed) {
      return NextResponse.json(
        {
          error:
            "This API key has hit its request limit. Try again in a moment.",
          retryAfter: Math.ceil((keyReset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((keyReset - Date.now()) / 1000)),
            "X-RateLimit-Limit-Key": String(keyLimit),
            "X-RateLimit-Remaining-Key": String(keyRemaining),
          },
        },
      );
    }

    // --- PROVIDER SETUP ---
    let model;
    if (provider === "gemini") {
      const google = createGoogleGenerativeAI({ apiKey });
      model = google("gemini-2.0-flash-lite");
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

    // Stream response back to client
    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(encoder.encode(chunk));
          }
          const usage = await result.usage;
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
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-RateLimit-Remaining-IP": String(ipRemaining),
        "X-RateLimit-Remaining-Key": String(keyRemaining),
      },
    });
  } catch (error) {
    console.error("Proxy execution error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
