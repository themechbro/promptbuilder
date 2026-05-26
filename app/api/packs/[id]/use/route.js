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

// POST /api/packs/[id]/use
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

  const { error } = await supabase.rpc("increment_pack_use_count", {
    pack_id: id,
  });

  if (error) {
    // Fallback: manual increment if RPC doesn't exist yet
    const { data: pack } = await supabase
      .from("prompt_packs")
      .select("use_count")
      .eq("id", id)
      .single();

    if (pack) {
      await supabase
        .from("prompt_packs")
        .update({ use_count: (pack.use_count || 0) + 1 })
        .eq("id", id);
    }
  }

  return NextResponse.json({ success: true });
}
