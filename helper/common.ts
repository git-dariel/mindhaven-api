import { config } from "../config/common";
import NodeCache from "node-cache";

/**
 * Cleans the response text by removing extra newlines and spaces
 */
export function cleanResponseText(text: string): string {
  return text
    .replace(/\n+/g, " ") // Replace newlines with spaces
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim(); // Remove leading/trailing spaces
}

/**
 * Formats text for TTS processing by selecting the most important initial paragraphs
 * while staying within API limits
 */
export function formatForTTS(text: string): string {
  // Remove markdown formatting
  text = text.replace(/\*\*/g, "");
  text = text.replace(/\*/g, "");

  // Split into paragraphs
  const paragraphs = text.split("\n\n").filter((p) => p.trim());

  // Always include the first paragraph (greeting/acknowledgment)
  let formattedText = paragraphs[0];

  // Try to add the second paragraph if it contains key points
  if (paragraphs[1] && formattedText.length + paragraphs[1].length < config.MAX_RESPONSE_LENGTH) {
    formattedText += "\n\n" + paragraphs[1];
  }

  // Add the first suggestion if there's room
  if (paragraphs[2] && formattedText.length + paragraphs[2].length < config.MAX_RESPONSE_LENGTH) {
    // Extract just the first suggestion without the bullet point
    const suggestion = paragraphs[2].replace(/^\*\s+/, "");
    formattedText += "\n\n" + suggestion;
  }

  return formattedText.trim();
}

/**
 * Extract the ID from Prisma response
 */
export function extractInsertedId(result: any): string {
  try {
    if (result && result.id) {
      return result.id.toString();
    }
    throw new Error("Could not extract id from result");
  } catch (error) {
    console.error("Error extracting id:", error);
    throw error;
  }
}

export function splitIntoChunks(text: string): string[] {
  // Replace periods with commas to maintain flow, except for sentence endings
  const processedText = text.replace(/\.\s+([a-z])/gi, ", $1");

  // Split only on strong breaks (! and ?)
  return processedText
    .split(/([!?]+\s+)/)
    .filter(Boolean)
    .reduce<string[]>((chunks, sentence) => {
      const lastChunk = chunks[chunks.length - 1] || "";

      if (lastChunk.length + sentence.length > config.MAX_CHUNK_LENGTH && lastChunk.length > 0) {
        return [...chunks, sentence.trim()];
      }

      if (chunks.length === 0) {
        return [sentence];
      }

      chunks[chunks.length - 1] = (lastChunk + sentence).trim();
      return chunks;
    }, []);
}

// Initialize cache with 1 hour TTL and check period of 600 seconds
export const ttsCache = new NodeCache({
  stdTTL: 3600,
  checkperiod: 600,
  useClones: false,
});
