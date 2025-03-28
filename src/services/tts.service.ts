import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import path from "path";

export class TTSService {
  private client: TextToSpeechClient;

  constructor() {
    this.client = new TextToSpeechClient({
      keyFilename: path.resolve(__dirname, "../../credentials/mindhaven-tts-e1026fbd1dc1.json"),
    });
  }

  private wrapWithSSML(text: string): string {
    // Add period if text doesn't end with punctuation
    const normalizedText = text.trim().match(/[.!?]$/) ? text : `${text}.`;

    // Split into sentences, including those without punctuation
    const sentences = normalizedText.split(/(?<=[.!?])\s+/).filter(Boolean);

    let ssml = "<speak>";
    for (const sentence of sentences) {
      const cleaned = sentence.trim();

      // Enhanced Filipino word detection using common patterns and word structure
      const hasFilipino = cleaned.match(
        /(?:[ng|mg|pag|ka|na|sa|po|mo|ko|ang|mga|si|ni|ay|at|o|kung|para|nang|hindi|ito|yan|yun|dito|diyan|doon|tayo|kami|kayo|sila|ako|ikaw|siya]\b|(?:[aeiou][ng]|[bdklmnpstw][aeiou]|[aeiou][bdklmnpstw])[a-z]*)/i
      );

      if (hasFilipino) {
        // Filipino sentence with natural prosody
        ssml += `<voice language="fil-PH">
          <prosody rate="1.1" pitch="+1st">
            ${cleaned.replace(/[.!?]$/, "")}
          </prosody>
        </voice><break time="150ms"/>`;
      } else {
        // English sentence with natural prosody
        ssml += `<voice language="en-US">
          <prosody rate="1.05" pitch="+1st">
            ${cleaned.replace(/[.!?]$/, "")}
          </prosody>
        </voice><break time="150ms"/>`;
      }
    }
    ssml += "</speak>";
    return ssml;
  }

  async synthesizeSpeech(text: string, ssml = false) {
    try {
      const request = {
        input: ssml ? { ssml: text } : { ssml: this.wrapWithSSML(text) },
        voice: {
          languageCode: "en-US",
          name: "en-US-Neural2-D",
          ssmlGender: "MALE" as const,
        },
        audioConfig: {
          audioEncoding: "MP3" as const,
          effectsProfileId: ["large-home-entertainment-class-device"],
          speakingRate: 1.0,
          pitch: 0,
          volumeGainDb: 2.0,
        },
      };

      const [response] = await this.client.synthesizeSpeech(request);
      return response.audioContent;
    } catch (error) {
      console.error("Error synthesizing speech:", error);
      throw error;
    }
  }
}

export const ttsService = new TTSService();
