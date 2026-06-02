import { NextResponse } from "next/server";
import { verifyApiKey } from "@/utils/apiKeyHelper";
import {
  rateLimiters,
  checkRateLimit,
  rateLimitResponse,
} from "@/utils/ratelimit";
import { generateEmbedding } from "@/utils/generateEmbedding";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const VALID_TYPES = ["persona", "protocol", "format", "template", "taxonomy"];

// POST /api/mcp/components/search
export async function POST(request) {
  try {
    // Auth
    const auth = await verifyApiKey(request);
    if (!auth) {
      return NextResponse.json(
        { error: "Invalid or expired API key." },
        { status: 401 },
      );
    }

    if (!auth.scopes.includes("components:read")) {
      return NextResponse.json(
        { error: "Insufficient scope." },
        { status: 403 },
      );
    }

    // Rate limit — reuse componentsSearch limiter, same cost profile
    const { success, retryAfter } = await checkRateLimit(
      rateLimiters.componentsSearch,
      auth.userId,
    );
    if (!success) return rateLimitResponse(retryAfter);

    const { query, type, threshold = 0.5, count = 5 } = await request.json();

    if (!query?.trim()) {
      return NextResponse.json(
        { error: "Query is required." },
        { status: 400 },
      );
    }

    if (query.trim().length < 3) {
      return NextResponse.json(
        { error: "Query must be at least 3 characters." },
        { status: 400 },
      );
    }

    if (type && !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` },
        { status: 400 },
      );
    }

    // Generate embedding from query
    const queryEmbedding = await generateEmbedding(query.trim());

    // Call match_components RPC
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/match_components`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query_embedding: queryEmbedding,
          match_threshold: threshold,
          match_count: count,
          target_type: type || null,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message },
        { status: response.status },
      );
    }

    const results = await response.json();

    return NextResponse.json({
      results,
      count: results.length,
      query: query.trim(),
      type: type || null,
    });
  } catch (err) {
    console.error("MCP semantic search error:", err.message);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
