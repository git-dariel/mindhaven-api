import { Request, Response } from "express";
import GeminiService from "./gemini.service";

const GeminiController = {
  generateResponse,
  generateSupportiveResponse,
};

export default GeminiController;

async function generateResponse(req: Request, res: Response) {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await GeminiService.generateResponse(prompt);
    return res.json({ response });
  } catch (error) {
    console.error("Error in Gemini controller:", error);
    return res.status(500).json({ error: "Failed to generate response" });
  }
}

async function generateSupportiveResponse(req: Request, res: Response) {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ error: "Input text is required" });
    }

    const response = await GeminiService.generateSupportiveResponse(input);
    return res.json({ response });
  } catch (error) {
    console.error("Error in Gemini supportive response controller:", error);
    return res.status(500).json({ error: "Failed to generate supportive response" });
  }
}
