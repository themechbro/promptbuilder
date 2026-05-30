import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateEmbedding } from "@/utils/generateEmbedding";
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

export async function PUT(request, { params }) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const { success, retryAfter } = await checkRateLimit(
    rateLimiters.packsPut,
    user.id,
  );
  if (!success) return rateLimitResponse(retryAfter);

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

  const { data: existing, error: fetchError } = await supabase
    .from("prompt_packs")
    .select("id, created_by, name, description")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Pack not found" }, { status: 404 });
  }

  if (existing.created_by !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let embeddingUpdate = {};
  const nameChanged = name.trim() !== existing.name;
  const descChanged =
    (description?.trim() || "") !== (existing.description || "");

  if (nameChanged || descChanged) {
    try {
      const text = `${name} ${description || ""}`.trim();
      embeddingUpdate = { embedding: await generateEmbedding(text) };
    } catch {
      // Non-fatal
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from("prompt_packs")
    .update({
      name: name.trim(),
      description: description?.trim() || null,
      slug: slug.trim(),
      category: category.trim(),
      persona_id: persona_id || null,
      protocol_ids: protocol_ids || [],
      format_id: format_id || null,
      template_id: template_id || null,
      is_public: Boolean(is_public ?? true),
      ...embeddingUpdate,
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    if (updateError.code === "23505") {
      return NextResponse.json(
        { error: `A pack with slug "${slug}" already exists.` },
        { status: 409 },
      );
    }
    console.error("Pack update error:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ pack: updated });
}

export async function DELETE(request, { params }) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const { success, retryAfter } = await checkRateLimit(
    rateLimiters.packsDelete,
    user.id,
  );
  if (!success) return rateLimitResponse(retryAfter);

  const { data: existing, error: fetchError } = await supabase
    .from("prompt_packs")
    .select("id, created_by")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Pack not found" }, { status: 404 });
  }

  if (existing.created_by !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error: deleteError } = await supabase
    .from("prompt_packs")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Pack delete error:", deleteError);
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id });
}
