import { NextResponse } from "next/server";
import { verifyApiKey } from "@/utils/apiKeyHelper";
import {
  rateLimiters,
  checkRateLimit,
  rateLimitResponse,
} from "@/utils/ratelimit";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// GET /api/mcp/components/[id]
export async function GET(request, { params }) {
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

    // Rate limit
    const { success, retryAfter } = await checkRateLimit(
      rateLimiters.mcpComponentsGet,
      auth.userId,
    );
    if (!success) return rateLimitResponse(retryAfter);

    const { id } = await params;

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/prompt_components?id=eq.${id}&or=(created_by.eq.${auth.userId},is_public.eq.true)&select=id,name,slug,type,content,version,is_public,created_at`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch component." },
        { status: 500 },
      );
    }

    const rows = await response.json();
    const component = rows?.[0];

    if (!component) {
      return NextResponse.json(
        { error: "Component not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ component });
  } catch (err) {
    console.error("MCP component get error:", err.message);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
