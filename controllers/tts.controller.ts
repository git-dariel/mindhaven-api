import { Request, Response } from "express";
import TTSService from "../services/tts.service";

const TTSController = {
  synthesize,
};

export default TTSController;

async function synthesize(req: Request, res: Response) {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const audioContent = await TTSService.synthesizeSpeech(text);

    if (!audioContent || !(audioContent instanceof Buffer)) {
      throw new Error("Invalid audio content received");
    }

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioContent.length,
      "Content-Disposition": "attachment; filename=speech.mp3",
    });

    return res.send(audioContent);
  } catch (error) {
    console.error("Error in TTS controller:", error);
    return res.status(500).json({ error: "Failed to synthesize speech" });
  }
}
