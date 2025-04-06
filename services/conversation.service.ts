import GeminiService from "./gemini.service";
import TTSService from "./tts.service";
import { formatForTTS } from "../helper/common";

const ConversationService = {
  generateSpeechResponse,
  generateSupportiveSpeechResponse,
};

export default ConversationService;

/**
 * Generates a spoken response using Gemini and TTS
 */
async function generateSpeechResponse(prompt: string) {
  try {
    // First, get the text response from Gemini
    const textResponse = await GeminiService.generateResponse(prompt);

    // Format the response for TTS while preserving paragraphs
    const formattedText = formatForTTS(textResponse);

    // Then convert the response to speech
    const audioContent = await TTSService.synthesizeSpeech(formattedText);

    return {
      text: textResponse, // Return full text response
      audio: audioContent,
      isTruncated: formattedText.length < textResponse.length,
    };
  } catch (error) {
    console.error("Error generating speech response:", error);
    throw error;
  }
}

/**
 * Generates a mental health focused spoken response
 */
async function generateSupportiveSpeechResponse(input: string) {
  try {
    // First, get the supportive text response from Gemini
    const textResponse = await GeminiService.generateSupportiveResponse(input);

    // Format the response for TTS while preserving paragraphs
    const formattedText = formatForTTS(textResponse);

    console.log("Formatted text for TTS:", formattedText);

    // Then convert the response to speech
    const audioContent = await TTSService.synthesizeSpeech(formattedText);

    return {
      text: textResponse, // Return full text response
      audio: audioContent,
      isTruncated: formattedText.length < textResponse.length,
    };
  } catch (error) {
    console.error("Error generating supportive speech response:", error);
    throw error;
  }
}
