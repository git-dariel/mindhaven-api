import { config } from "../config/common";

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
