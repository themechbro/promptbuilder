import { NextResponse } from "next/server";
import { verifyApiKey } from "@/utils/apiKeyHelper";
import {
  rateLimiters,
  checkRateLimit,
  rateLimitResponse,
} from "@/utils/ratelimit";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// GET /api/mcp/packs/[id]
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

    if (!auth.scopes.includes("packs:read")) {
      return NextResponse.json(
        { error: "Insufficient scope." },
        { status: 403 },
      );
    }

    // Rate limit
    const { success, retryAfter } = await checkRateLimit(
      rateLimiters.mcpPacksGet,
      auth.userId,
    );
    if (!success) return rateLimitResponse(retryAfter);

    const { id } = await params;

    // Fetch pack — public only
    const packRes = await fetch(
      `${SUPABASE_URL}/rest/v1/prompt_packs?id=eq.${id}&is_public=eq.true&select=id,name,description,slug,category,use_count,persona_id,protocol_ids,format_id,template_id,created_at`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    );

    if (!packRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch pack." },
        { status: 500 },
      );
    }

    const rows = await packRes.json();
    const pack = rows?.[0];

    if (!pack) {
      return NextResponse.json({ error: "Pack not found." }, { status: 404 });
    }

    // Resolve component IDs to full objects
    const componentIds = [
      pack.persona_id,
      ...(pack.protocol_ids || []),
      pack.format_id,
      pack.template_id,
    ].filter(Boolean);

    let components = {};

    if (componentIds.length > 0) {
      const compRes = await fetch(
        `${SUPABASE_URL}/rest/v1/prompt_components?id=in.(${componentIds.join(",")})&select=id,name,slug,type,content,version`,
        {
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
        },
      );

      if (compRes.ok) {
        const compData = await compRes.json();
        components = Object.fromEntries(compData.map((c) => [c.id, c]));
      }
    }

    // Return pack with fully resolved components — MCP client gets everything in one call
    return NextResponse.json({
      pack: {
        ...pack,
        persona: pack.persona_id ? components[pack.persona_id] || null : null,
        protocols: (pack.protocol_ids || [])
          .map((id) => components[id] || null)
          .filter(Boolean),
        format: pack.format_id ? components[pack.format_id] || null : null,
        template: pack.template_id
          ? components[pack.template_id] || null
          : null,
      },
    });
  } catch (err) {
    console.error("MCP pack get error:", err.message);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
