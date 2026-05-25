import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_EMBEDDING_API_KEY = process.env.GOOGLE_EMBEDDING_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function generateEmbedding(text) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GOOGLE_EMBEDDING_API_KEY, // use the const, not apiKey
      },
      body: JSON.stringify({
        content: { parts: [{ text: text.trim() }] },
        output_dimensionality: 768,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Embedding API error: ${error.error?.message}`);
  }

  const data = await response.json();
  return data.embedding.values;
}

async function backfill() {
  console.log("Fetching components with missing embeddings...");

  const { data: components, error } = await supabase
    .from("prompt_components")
    .select("id, name, content")
    .is("embedding", null);

  if (error) {
    console.error("Failed to fetch components:", error.message);
    process.exit(1);
  }

  console.log(`Found ${components.length} components to backfill.`);

  for (const component of components) {
    try {
      console.log(`Generating embedding for: ${component.name}`);

      const embedding = await generateEmbedding(
        `${component.name}\n\n${component.content}`,
      );

      const { error: updateError } = await supabase
        .from("prompt_components")
        .update({ embedding })
        .eq("id", component.id);

      if (updateError) {
        console.error(
          `Failed to update ${component.name}:`,
          updateError.message,
        );
      } else {
        console.log(`✓ ${component.name}`);
      }

      // Rate limit — 1 request per second to avoid hitting Google API limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      console.error(`✗ ${component.name}:`, err.message);
    }
  }

  console.log("Backfill complete.");
}

backfill();
