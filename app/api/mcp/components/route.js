import { NextResponse } from "next/server";
import { verifyApiKey } from "@/utils/apiKeyHelper";
import {
  rateLimiters,
  checkRateLimit,
  rateLimitResponse,
} from "@/utils/ratelimit";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const VALID_TYPES = ["persona", "protocol", "format", "template", "taxonomy"];

// GET /api/mcp/components?type=persona&q=customer
export async function GET(request) {
  try {
    // Auth — API key only, no session cookies
    const auth = await verifyApiKey(request);
    if (!auth) {
      return NextResponse.json(
        { error: "Invalid or expired API key." },
        { status: 401 },
      );
    }

    // Check scope
    if (!auth.scopes.includes("components:read")) {
      return NextResponse.json(
        { error: "Insufficient scope." },
        { status: 403 },
      );
    }

    // Rate limit — keyed by userId from verified API key
    const { success, retryAfter } = await checkRateLimit(
      rateLimiters.mcpComponentsList,
      auth.userId,
    );
    if (!success) return rateLimitResponse(retryAfter);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const q = searchParams.get("q")?.trim();

    // Validate type if provided
    if (type && !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` },
        { status: 400 },
      );
    }
    const slug = searchParams.get("slug");

    // Build filter — own components + all public ones
    let filter = `or=(created_by.eq.${auth.userId},is_public.eq.true)`;
    if (type) filter += `&type=eq.${type}`;
    if (slug) filter += `&slug=eq.${slug}`;
    // Text search on name if q provided
    if (q) filter += `&name=ilike.*${encodeURIComponent(q)}*`;

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/prompt_components?${filter}&select=id,name,slug,type,content,version,is_public,created_at&order=name.asc&limit=50`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch components." },
        { status: 500 },
      );
    }

    const components = await response.json();

    return NextResponse.json({
      components,
      count: components.length,
      filters: { type: type || null, q: q || null },
    });
  } catch (err) {
    console.error("MCP components list error:", err.message);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
