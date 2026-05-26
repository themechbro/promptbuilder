import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateEmbedding } from "@/utils/generateEmbedding";

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

// GET /api/packs?category=code-review&q=search+term&limit=20&offset=0
export async function GET(request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let packIds = null;

    // Semantic search — get matching IDs first
    if (q && q.length >= 3) {
      try {
        const embedding = await generateEmbedding(q);
        const { data: matches } = await supabase.rpc("match_packs", {
          query_embedding: embedding,
          match_threshold: 0.3,
          match_count: 50,
        });
        packIds = matches?.map((m) => m.id) || [];
        if (packIds.length === 0) {
          return NextResponse.json({ packs: [], total: 0 });
        }
      } catch {
        // Embedding failed — fall through to text search
      }
    }

    let query = supabase
      .from("prompt_packs")
      .select(
        `
        id, name, description, slug, category, use_count, is_public, created_at,
        created_by,
        persona:persona_id(id, name, slug, type),
        format:format_id(id, name, slug, type),
        template:template_id(id, name, slug, type),
        protocols:protocol_ids
      `,
        { count: "exact" },
      )
      .eq("is_public", true)
      .order("use_count", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) query = query.eq("category", category);
    if (packIds) query = query.in("id", packIds);

    // Fallback text search if no semantic
    if (q && !packIds) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }

    const { data: packs, error, count } = await query;

    if (error) {
      console.error("Fetch packs error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch protocol component details for each pack
    const allProtocolIds = [
      ...new Set(packs.flatMap((p) => p.protocols || [])),
    ];
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

    // Check which packs this user has saved
    const packIdList = packs.map((p) => p.id);
    const { data: savedPacks } = await supabase
      .from("user_saved_packs")
      .select("pack_id")
      .eq("user_id", user.id)
      .in("pack_id", packIdList);

    const savedSet = new Set((savedPacks || []).map((s) => s.pack_id));

    const enriched = packs.map((pack) => ({
      ...pack,
      protocol_components: (pack.protocols || [])
        .map((id) => protocolMap[id] || null)
        .filter(Boolean),
      is_saved: savedSet.has(pack.id),
      is_owner: pack.created_by === user.id,
    }));

    return NextResponse.json({ packs: enriched, total: count });
  } catch (err) {
    console.error("Packs GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/packs
export async function POST(request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    name,
    description,
    slug,
    category,
    persona_id,
    protocol_ids,
    format_id,
    template_id,
    is_public,
  } = body;

  if (!name?.trim() || !slug?.trim() || !category?.trim()) {
    return NextResponse.json(
      { error: "name, slug, and category are required" },
      { status: 400 },
    );
  }

  if (!protocol_ids || protocol_ids.length === 0) {
    return NextResponse.json(
      { error: "At least one protocol is required" },
      { status: 400 },
    );
  }

  // Generate embedding from name + description
  let embedding = null;
  try {
    const text = `${name} ${description || ""}`.trim();
    embedding = await generateEmbedding(text);
  } catch {
    // Non-fatal
  }

  const { data: pack, error } = await supabase
    .from("prompt_packs")
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      slug: slug.trim(),
      category: category.trim(),
      persona_id: persona_id || null,
      protocol_ids: protocol_ids,
      format_id: format_id || null,
      template_id: template_id || null,
      is_public: Boolean(is_public ?? true),
      created_by: user.id,
      embedding,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: `A pack with slug "${slug}" already exists.` },
        { status: 409 },
      );
    }
    console.error("Pack create error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ pack }, { status: 201 });
}
