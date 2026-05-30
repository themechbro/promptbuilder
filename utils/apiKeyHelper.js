// Raw key format: pb_<32 hex chars>
// Only the hash is ever stored in DB — raw key shown once and never again

export function generateRawKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `pb_${hex}`;
}

export async function hashKey(rawKey) {
  const encoder = new TextEncoder();
  const data = encoder.encode(rawKey);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Extract display prefix — first 12 chars + ellipsis
// e.g. pb_a1b2c3d4... — enough to identify the key visually
export function keyPrefix(rawKey) {
  return rawKey.slice(0, 12);
}

// Used in MCP-facing endpoints to authenticate external requests
// Uses service role — bypasses RLS, correct for server-to-server auth
export async function verifyApiKey(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const rawKey = authHeader.slice(7).trim();
  if (!rawKey.startsWith("pb_")) return null;

  const keyHash = await hashKey(rawKey);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/api_keys?key_hash=eq.${keyHash}&is_active=eq.true&select=id,user_id,scopes,expires_at`,
    {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    },
  );

  if (!response.ok) return null;

  const rows = await response.json();
  const apiKey = rows?.[0];
  if (!apiKey) return null;

  // Check expiry
  if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
    return null;
  }

  // Update last_used_at — fire and forget, non-blocking
  fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/api_keys?id=eq.${apiKey.id}`,
    {
      method: "PATCH",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ last_used_at: new Date().toISOString() }),
    },
  ).catch(() => {}); // non-fatal

  return {
    userId: apiKey.user_id,
    scopes: apiKey.scopes,
  };
}
