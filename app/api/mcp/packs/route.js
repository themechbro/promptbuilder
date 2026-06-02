import { NextResponse } from "next/server";
import { verifyApiKey } from "@/utils/apiKeyHelper";
import {
  rateLimiters,
  checkRateLimit,
  rateLimitResponse,
} from "@/utils/ratelimit";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const VALID_CATEGORIES = [
  "code-review",
  "writing",
  "analysis",
  "research",
  "debugging",
  "documentation",
  "planning",
  "data",
  "customer-support",
  "hr",
];

// GET /api/mcp/packs?category=hr&q=interview
export async function GET(request) {
  try {
    // Auth
    const auth = await verifyApiKey(request);
    if (!auth) {
      return NextResponse.json(
        { error: "Invalid or expired API key." },
        { status: 401 },
      );
    }

    if (!auth.scopes.includes("packs:read")) {
      return NextResponse.json(
        { error: "Insufficient scope." },
        { status: 403 },
      );
    }

    // Rate limit
    const { success, retryAfter } = await checkRateLimit(
      rateLimiters.mcpPacksList,
      auth.userId,
    );
    if (!success) return rateLimitResponse(retryAfter);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q")?.trim();

    if (category && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        {
          error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`,
        },
        { status: 400 },
      );
    }
    const slug = searchParams.get("slug");

    // Public packs only for MCP — no private packs via API key
    let filter = `is_public=eq.true`;
    if (category) filter += `&category=eq.${category}`;
    if (slug) filter += `&slug=eq.${slug}`;
    if (q) filter += `&name=ilike.*${encodeURIComponent(q)}*`;

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/prompt_packs?${filter}&select=id,name,description,slug,category,use_count,persona_id,protocol_ids,format_id,template_id,created_at&order=use_count.desc&limit=50`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch packs." },
        { status: 500 },
      );
    }

    const packs = await response.json();

    return NextResponse.json({
      packs,
      count: packs.length,
      filters: { category: category || null, q: q || null },
    });
  } catch (err) {
    console.error("MCP packs list error:", err.message);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
