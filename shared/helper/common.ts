import { config } from "../../config/common";
import NodeCache from "node-cache";
import crypto from "crypto";

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
  // Remove all markdown and special characters
  text = text
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks completely
    .replace(/#{1,6}\s?/g, "") // Remove heading markers
    .replace(/\*\*/g, "") // Remove bold markers
    .replace(/\*/g, "") // Remove italic markers
    .replace(/\\boxed{/g, "") // Remove boxed markers
    .replace(/[`{}\\#_~]/g, "") // Remove special characters
    .replace(/\n+/g, " ") // Replace newlines with spaces
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/\s+\./g, ".") // Fix spacing before periods
    .replace(/\s+,/g, ",") // Fix spacing before commas
    .trim();

  // Split into sentences and clean each one
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length === 0) {
    return "";
  }

  // Always include the first sentence
  let formattedText = sentences[0];

  // Add subsequent sentences if they fit within limits
  for (let i = 1; i < sentences.length; i++) {
    const nextSentence = sentences[i];
    if (formattedText.length + nextSentence.length + 1 < config.MAX_RESPONSE_LENGTH) {
      formattedText += " " + nextSentence;
    } else {
      break;
    }
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

export const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");
