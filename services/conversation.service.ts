import GeminiService from "./gemini.service";
import TTSService from "./tts.service";
import { formatForTTS } from "../helper/common";

const ConversationService = {
  generateSpeechResponse,
  generateSupportiveSpeechResponse,
};

export default ConversationService;

/**
 * Generates a spoken response using Gemini and TTS in parallel
 */
async function generateSpeechResponse(prompt: string) {
  try {
    // Get the text response from Gemini
    const textResponsePromise = GeminiService.generateResponse(prompt);

    // Wait for the text response
    const textResponse = await textResponsePromise;

    // Format the response for TTS while preserving paragraphs
    const formattedText = formatForTTS(textResponse);

    // Start TTS conversion immediately after formatting
    const audioPromise = TTSService.synthesizeSpeech(formattedText);

    // Wait for audio conversion to complete
    const audioContent = await audioPromise;

    return {
      text: textResponse,
      audio: audioContent,
      isTruncated: formattedText.length < textResponse.length,
    };
  } catch (error) {
    console.error("Error generating speech response:", error);
    throw error;
  }
}

/**
 * Generates a mental health focused spoken response with parallel processing
 */
async function generateSupportiveSpeechResponse(input: string) {
  try {
    // Get the supportive text response from Gemini
    const textResponsePromise = GeminiService.generateSupportiveResponse(input);

    // Wait for the text response
    const textResponse = await textResponsePromise;

    // Format the response for TTS while preserving paragraphs
    const formattedText = formatForTTS(textResponse);

    console.log("Formatted Text for TTS:", formattedText);

    // Start TTS conversion immediately after formatting
    const audioPromise = TTSService.synthesizeSpeech(formattedText);

    // Wait for audio conversion to complete
    const audioContent = await audioPromise;

    return {
      text: textResponse,
      audio: audioContent,
      isTruncated: formattedText.length < textResponse.length,
    };
  } catch (error) {
    console.error("Error generating supportive speech response:", error);
    throw error;
  }
}
