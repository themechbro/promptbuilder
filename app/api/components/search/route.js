import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { generateEmbedding } from "@/utils/generateEmbedding";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const lastCallMap = new Map();

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function POST(request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const now = Date.now();
    const lastCall = lastCallMap.get(user.id) || 0;
    if (now - lastCall < 100) {
      return NextResponse.json(
        { error: "Too many requests." },
        { status: 429 },
      );
    }
    lastCallMap.set(user.id, now);

    const { query, type, threshold = 0.5, count = 5 } = await request.json();

    if (!query?.trim()) {
      return NextResponse.json(
        { error: "Query is required." },
        { status: 400 },
      );
    }

    const validTypes = [
      "persona",
      "protocol",
      "format",
      "taxonomy",
      "template",
    ];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Valid type is required." },
        { status: 400 },
      );
    }

    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query);

    // Call match_components RPC
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/match_components`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query_embedding: queryEmbedding,
          match_threshold: threshold,
          match_count: count,
          target_type: type,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message },
        { status: response.status },
      );
    }

    const results = await response.json();
    return NextResponse.json({ results });
  } catch (err) {
    console.error("Semantic search error:", err.message);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
