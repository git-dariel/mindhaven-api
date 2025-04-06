import { generalModel, supportiveModel } from "../utils/gemini.utils";
import { MENTAL_HEALTH_GUIDELINES } from "../config/common";
import { cleanResponseText } from "../helper/common";

const GeminiService = {
  generateResponse,
  generateSupportiveResponse,
};

export default GeminiService;

/**
 * Generates a general response using the Gemini model
 */
async function generateResponse(prompt: string) {
  try {
    // Simple, direct prompt for faster response
    const enhancedPrompt = `Brief response: ${prompt}`;

    const result = await generalModel.generateContent(enhancedPrompt);
    const response = await result.response;
    return cleanResponseText(response.text());
  } catch (error) {
    console.error("Error generating Gemini response:", error);
    throw error;
  }
}

/**
 * Generates a mental health focused supportive response
 */
async function generateSupportiveResponse(userInput: string) {
  try {
    // Direct prompt focused on actionable suggestion
    const fullPrompt = `${MENTAL_HEALTH_GUIDELINES}\n\nUser: ${userInput}\n\nProvide a brief empathetic response with one clear suggestion:`;

    const result = await supportiveModel.generateContent(fullPrompt);
    const response = await result.response;
    return cleanResponseText(response.text());
  } catch (error) {
    console.error("Error generating supportive response:", error);
    throw error;
  }
}
