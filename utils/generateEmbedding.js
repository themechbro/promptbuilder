/**
 * Generates a vector embedding for a given text using Google's
 * text-embedding-004 model via the Gemini API.
 * Returns a 768-dimension vector.
 */
export async function generateEmbedding(text) {
  if (!text || typeof text !== "string" || !text.trim()) {
    throw new Error("Text is required to generate an embedding.");
  }

  const apiKey = process.env.GOOGLE_EMBEDDING_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_EMBEDDING_API_KEY is not set.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        content: { parts: [{ text: text.trim() }] },
        output_dimensionality: 768,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Embedding API error: ${error.error?.message || response.statusText}`,
    );
  }

  const data = await response.json();
  return data.embedding.values;
}
