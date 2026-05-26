import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

// POST /api/packs/[id]/save — bookmark a pack
export async function POST(request, { params }) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify pack exists
  const { data: pack, error: packError } = await supabase
    .from("prompt_packs")
    .select("id")
    .eq("id", id)
    .single();

  if (packError || !pack) {
    return NextResponse.json({ error: "Pack not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("user_saved_packs")
    .insert({ user_id: user.id, pack_id: id });

  if (error) {
    // Already saved — not an error worth surfacing
    if (error.code === "23505") {
      return NextResponse.json({ saved: true });
    }
    console.error("Save pack error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ saved: true });
}

// DELETE /api/packs/[id]/save — unsave a pack
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

  const { error } = await supabase
    .from("user_saved_packs")
    .delete()
    .eq("user_id", user.id)
    .eq("pack_id", id);

  if (error) {
    console.error("Unsave pack error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ saved: false });
}
