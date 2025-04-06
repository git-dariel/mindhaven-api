import { client } from "../helper/tts.helper";

const TTSService = {
  synthesizeSpeech,
};

export default TTSService;

async function synthesizeSpeech(text: string) {
  try {
    const request = {
      input: { text },
      voice: {
        languageCode: "en-US",
        name: "en-US-Chirp-HD-F",
        ssmlGender: "FEMALE" as const,
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
