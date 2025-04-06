import { client } from "../helper/tts.helper";
import { wrapWithSSML } from "../utils/tts.utils";

const TTSService = {
  synthesizeSpeech,
};

export default TTSService;

async function synthesizeSpeech(text: string, ssml = false) {
  try {
    const request = {
      input: ssml ? { ssml: text } : { ssml: wrapWithSSML(text) },
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

    const [response] = await client.synthesizeSpeech(request);
    return response.audioContent;
  } catch (error) {
    console.error("Error synthesizing speech:", error);
    throw error;
  }
}
