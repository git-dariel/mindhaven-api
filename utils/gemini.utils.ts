import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// Initialize the Gemini AI model
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Create a reusable model instance
export const generalModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.6, // Reduced for faster, more focused responses
    topK: 20, // Reduced for faster processing
    topP: 0.8, // Adjusted for better balance
    maxOutputTokens: 150, // Reduced for shorter, faster responses
  },
});

export const supportiveModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.6,
    topK: 20,
    topP: 0.8,
    maxOutputTokens: 150,
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
