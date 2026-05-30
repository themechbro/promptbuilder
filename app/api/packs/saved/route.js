import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  rateLimiters,
  checkRateLimit,
  rateLimitResponse,
} from "@/utils/ratelimit";

async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const { success, retryAfter } = await checkRateLimit(
    rateLimiters.packsSavedGet,
    user.id,
  );
  if (!success) return rateLimitResponse(retryAfter);

  const { data: savedRows, error: savedError } = await supabase
    .from("user_saved_packs")
    .select("pack_id, saved_at")
    .eq("user_id", user.id)
    .order("saved_at", { ascending: false });

  if (savedError) {
    console.error("Fetch saved packs error:", savedError);
    return NextResponse.json({ error: savedError.message }, { status: 500 });
  }

  if (!savedRows || savedRows.length === 0) {
    return NextResponse.json({ packs: [] });
  }

  const packIds = savedRows.map((r) => r.pack_id);

  const { data: packs, error: packsError } = await supabase
    .from("prompt_packs")
    .select(
      `id, name, description, slug, category, use_count, is_public, created_at,
      created_by,
      persona:persona_id(id, name, slug, type),
      format:format_id(id, name, slug, type),
      template:template_id(id, name, slug, type),
      protocols:protocol_ids`,
    )
    .in("id", packIds);

  if (packsError) {
    console.error("Fetch pack details error:", packsError);
    return NextResponse.json({ error: packsError.message }, { status: 500 });
  }

  const allProtocolIds = [...new Set(packs.flatMap((p) => p.protocols || []))];
  let protocolMap = {};

  if (allProtocolIds.length > 0) {
    const { data: protocolComponents } = await supabase
      .from("prompt_components")
      .select("id, name, slug, type")
      .in("id", allProtocolIds);

    protocolMap = Object.fromEntries(
      (protocolComponents || []).map((p) => [p.id, p]),
    );
  }

  const savedAtMap = Object.fromEntries(
    savedRows.map((r) => [r.pack_id, r.saved_at]),
  );

  const enriched = packIds
    .map((id) => {
      const pack = packs.find((p) => p.id === id);
      if (!pack) return null;
      return {
        ...pack,
        protocol_components: (pack.protocols || [])
          .map((id) => protocolMap[id] || null)
          .filter(Boolean),
        is_saved: true,
        is_owner: pack.created_by === user.id,
        saved_at: savedAtMap[id],
      };
    })
    .filter(Boolean);

  return NextResponse.json({ packs: enriched });
}
