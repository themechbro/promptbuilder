import { encode } from "gpt-tokenizer";

/**
 * Calculates the exact token count of a given text block using the cl100k_base encoding scheme.
 * Safe for runtime rendering loops.
 * 
 * @param {string} text - The input text or compiled prompt string
 * @returns {number}    - Total integer count of tokens
 */
export function countTokens(text) {
  if (!text || typeof text !== "string") {
    return 0;
  }

  try {
    // Encodes the raw text string into an array of token integers
    const tokenArray = encode(text);
    return tokenArray.length;
  } catch (error) {
    console.error("Tokenization error encountered:", error);
    // Fallback safe value to ensure UI components don't crash during interactive inputs
    return 0;
  }
}