import { Request, Response } from "express";
import ConversationService from "../services/conversation.service";

const ConversationController = {
  generateSpeechResponse,
  generateSupportiveSpeechResponse,
};

export default ConversationController;

async function generateSpeechResponse(req: Request, res: Response) {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const { text, audio, isTruncated } = await ConversationService.generateSpeechResponse(prompt);

    if (!audio || !(audio instanceof Buffer)) {
      throw new Error("Invalid audio content received");
    }

    // Set response headers for audio streaming
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audio.length,
      "Content-Disposition": "attachment; filename=response.mp3",
      "X-Response-Text": Buffer.from(text).toString("base64"),
      "X-Response-Truncated": isTruncated ? "true" : "false",
    });

    return res.send(audio);
  } catch (error) {
    console.error("Error in conversation controller:", error);
    return res.status(500).json({
      error: "Failed to generate speech response",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function generateSupportiveSpeechResponse(req: Request, res: Response) {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ error: "Input text is required" });
    }

    const { text, audio, isTruncated } = await ConversationService.generateSupportiveSpeechResponse(
      input
    );

    if (!audio || !(audio instanceof Buffer)) {
      throw new Error("Invalid audio content received");
    }

    // Set response headers for audio streaming
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audio.length,
      "Content-Disposition": "attachment; filename=response.mp3",
      "X-Response-Text": Buffer.from(text).toString("base64"),
      "X-Response-Truncated": isTruncated ? "true" : "false",
    });

    return res.send(audio);
  } catch (error) {
    console.error("Error in supportive conversation controller:", error);
    return res.status(500).json({
      error: "Failed to generate supportive speech response",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
