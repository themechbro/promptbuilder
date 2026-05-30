import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { generateEmbedding } from "@/utils/generateEmbedding";
import {
  rateLimiters,
  checkRateLimit,
  rateLimitResponse,
} from "@/utils/ratelimit";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Helper to get authenticated user from session
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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const validTypes = [
      "persona",
      "protocol",
      "format",
      "taxonomy",
      "template",
    ];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid or missing type parameter." },
        { status: 400 },
      );
    }

    // Auth first
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Rate limit — per user ID
    const { success, retryAfter } = await checkRateLimit(
      rateLimiters.componentsGet,
      user.id,
    );
    if (!success) return rateLimitResponse(retryAfter);

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/prompt_components?type=eq.${type}&or=(created_by.eq.${user.id},is_public.eq.true)&select=id,name,slug,content,metadata,version,is_public,type`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json({ components: data });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    // Auth first
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Rate limit — per user ID
    const { success, retryAfter } = await checkRateLimit(
      rateLimiters.componentsPost,
      user.id,
    );
    if (!success) return rateLimitResponse(retryAfter);

    const body = await request.json();
    const { name, type, content, version, is_public } = body;

    if (!name?.trim() || !type || !content?.trim()) {
      return NextResponse.json(
        { error: "Name, type and content are required." },
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
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid component type." },
        { status: 400 },
      );
    }

    const slug = name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    let embedding = null;
    try {
      embedding = await generateEmbedding(
        `${name.trim()}\n\n${content.trim()}`,
      );
    } catch (embErr) {
      console.error("Embedding generation failed:", embErr.message);
    }

    const payload = {
      name: name.trim(),
      slug,
      type,
      content: content.trim(),
      version: version?.trim() || "1.0.0",
      is_public: is_public ?? false,
      created_by: user.id,
      ...(embedding && { embedding: JSON.stringify(embedding) }),
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/prompt_components`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json({ component: data[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
