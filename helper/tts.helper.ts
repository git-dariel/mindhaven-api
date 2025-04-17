import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import path from "path";
import fs from "fs";

function findTTSCredentialsFile(): string {
  const credentialsDir = path.resolve(__dirname, "../credentials");
  const files = fs.readdirSync(credentialsDir);
  const ttsJsonFile = files.find(
    (file) =>
      (file.endsWith(".json") && file.includes("tts")) ||
      file.includes("mindhaven")
  );

  if (!ttsJsonFile) {
    throw new Error(
      "TTS credentials file not found in the credentials directory."
    );
  }

  return path.join(credentialsDir, ttsJsonFile);
}

export const client = new TextToSpeechClient({
  keyFilename: findTTSCredentialsFile(),
});
