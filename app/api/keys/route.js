import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { generateRawKey, hashKey, keyPrefix } from "@/utils/apiKeyHelper";
import {
  rateLimiters,
  checkRateLimit,
  rateLimitResponse,
} from "@/utils/ratelimit";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

// GET /api/keys — list user's keys (prefix + metadata only, never hash)
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { success, retryAfter } = await checkRateLimit(
      rateLimiters.keysGet,
      user.id,
    );
    if (!success) return rateLimitResponse(retryAfter);

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/api_keys?user_id=eq.${user.id}&select=id,name,key_prefix,scopes,last_used_at,created_at,expires_at,is_active&order=created_at.desc`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch keys." },
        { status: 500 },
      );
    }

    const keys = await response.json();
    return NextResponse.json({ keys });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

// POST /api/keys — generate a new API key
export async function POST(request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { success, retryAfter } = await checkRateLimit(
      rateLimiters.keysPost,
      user.id,
    );
    if (!success) return rateLimitResponse(retryAfter);

    const { name, expires_at } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Key name is required." },
        { status: 400 },
      );
    }

    // Enforce max 10 keys per user
    const countRes = await fetch(
      `${SUPABASE_URL}/rest/v1/api_keys?user_id=eq.${user.id}&select=id`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: "count=exact",
        },
      },
    );
    const countHeader = countRes.headers.get("content-range");
    const total = parseInt(countHeader?.split("/")[1] || "0");
    if (total >= 10) {
      return NextResponse.json(
        {
          error:
            "Maximum of 10 API keys allowed. Revoke an existing key first.",
        },
        { status: 400 },
      );
    }

    // Generate key
    const rawKey = generateRawKey();
    const key_hash = await hashKey(rawKey);
    const key_prefix = keyPrefix(rawKey);

    const payload = {
      user_id: user.id,
      name: name.trim(),
      key_hash,
      key_prefix,
      scopes: ["components:read", "packs:read"],
      is_active: true,
      ...(expires_at ? { expires_at } : {}),
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/api_keys`, {
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
      return NextResponse.json(
        { error: "Failed to create key." },
        { status: 500 },
      );
    }

    const rows = await response.json();

    // Return raw key ONCE — never stored, never returned again
    return NextResponse.json(
      {
        key: rows[0],
        rawKey, // shown once in UI, then discarded
      },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
