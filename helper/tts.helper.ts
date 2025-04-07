import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import path from "path";

export const client = new TextToSpeechClient({
  keyFilename: path.resolve(__dirname, "../credentials/mindhaven-tts-e1026fbd1dc1.json"),
});
