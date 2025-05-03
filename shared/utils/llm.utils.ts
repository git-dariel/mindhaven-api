import OpenAI from "openai";

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY environment variable is not set");
}

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export default openai;
