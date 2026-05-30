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

// PUT /api/components/[id]
export async function PUT(request, { params }) {
  const supabase = await createClient();

  // Auth first
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit — per user ID
  const { success, retryAfter } = await checkRateLimit(
    rateLimiters.componentsPut,
    user.id,
  );
  if (!success) return rateLimitResponse(retryAfter);

  const { id } = await params;
  const body = await request.json();
  const { type, name, slug, version, content, metadata, is_public } = body;

  if (!name?.trim() || !slug?.trim() || !content?.trim()) {
    return NextResponse.json(
      { error: "name, slug, and content are required" },
      { status: 400 },
    );
  }

  const { data: existing, error: fetchError } = await supabase
    .from("prompt_components")
    .select("id, created_by, content")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Component not found" }, { status: 404 });
  }

  if (existing.created_by !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let embeddingUpdate = {};
  if (content.trim() !== existing.content.trim()) {
    try {
      const embedding = await generateEmbedding(content);
      embeddingUpdate = { embedding };
    } catch (err) {
      console.error("Embedding generation failed:", err);
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from("prompt_components")
    .update({
      type,
      name: name.trim(),
      slug: slug.trim(),
      version: version?.trim() || "1.0.0",
      content: content.trim(),
      metadata: metadata || {},
      is_public: Boolean(is_public),
      ...embeddingUpdate,
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    if (updateError.code === "23505") {
      return NextResponse.json(
        {
          error: `A ${type} with slug "${slug}" already exists in your vault.`,
        },
        { status: 409 },
      );
    }
    console.error("Update error:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ component: updated });
}

// DELETE /api/components/[id]
export async function DELETE(request, { params }) {
  const supabase = await createClient();

  // Auth first
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit — per user ID
  const { success, retryAfter } = await checkRateLimit(
    rateLimiters.componentsDelete,
    user.id,
  );
  if (!success) return rateLimitResponse(retryAfter);

  const { id } = await params;

  const { data: existing, error: fetchError } = await supabase
    .from("prompt_components")
    .select("id, created_by, name")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Component not found" }, { status: 404 });
  }

  if (existing.created_by !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error: deleteError } = await supabase
    .from("prompt_components")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Delete error:", deleteError);
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id });
}
