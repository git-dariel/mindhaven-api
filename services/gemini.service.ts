import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { MENTAL_HEALTH_GUIDELINES } from "../config/common";
import { cleanResponseText } from "../helper/common";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// Initialize the Gemini AI model
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 250,
      },
    });

    // Add context for better responses
    const enhancedPrompt = `Please provide a brief (1-2 paragraphs) response to: ${prompt}\n\nMake sure to match the language of the question (English or Filipino) and focus on one key point or suggestion.`;

    const result = await model.generateContent(enhancedPrompt);
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
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 250,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT" as HarmCategory,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH" as HarmCategory,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT" as HarmCategory,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Combine the guidelines with the user input
    const fullPrompt = `${MENTAL_HEALTH_GUIDELINES}\n\nUser Input: ${userInput}\n\nProvide a brief response (1-2 paragraphs maximum) that includes:\n1. An empathetic acknowledgment\n2. One clear, actionable suggestion\n\nResponse:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return cleanResponseText(response.text());
  } catch (error) {
    console.error("Error generating supportive response:", error);
    throw error;
  }
}
