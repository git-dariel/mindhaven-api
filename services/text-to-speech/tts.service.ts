import { splitIntoChunks, ttsCache } from "../../shared/helper/common";
import { client } from "../../shared/helper/tts.helper";

const TTSService = {
  synthesizeSpeech,
};

export default TTSService;

async function synthesizeSpeech(text: string) {
  try {
    console.log("Synthesizing speech for text:", text);

    const cacheKey = Buffer.from(text).toString("base64");
    const cachedAudio = ttsCache.get(cacheKey);
    if (cachedAudio) {
      return cachedAudio;
    }

    const chunks = splitIntoChunks(text);

    const audioPromises = chunks.map((chunk) => synthesizeChunk(chunk));
    const audioContents = await Promise.all(audioPromises);

    const validAudioContents = audioContents.filter(
      (content): content is Buffer => content !== null
    );

    const periodSilence = Buffer.from(new Array(2580).fill(0x00));
    const chunkSilence = Buffer.from(new Array(1200).fill(0x00));

    const fadeLength = 800;
    const fadeOutSilence = Buffer.from(
      Array.from({ length: fadeLength }, (_, i) => {
        const fadeRatio = Math.pow(1 - i / fadeLength, 2);
        return Math.floor(fadeRatio * 0x7f);
      })
    );

    const combinedAudio = Buffer.concat(
      validAudioContents.flatMap((content, i) => {
        const isLastChunk = i === validAudioContents.length - 1;
        const endsWithPeriod = chunks[i].trim().endsWith(".");

        if (isLastChunk) return [content, fadeOutSilence];
        if (endsWithPeriod) return [content, periodSilence];
        return [content, chunkSilence];
      })
    );

    ttsCache.set(cacheKey, combinedAudio);

    return combinedAudio;
  } catch (error) {
    console.error("Error synthesizing speech:", error);
    throw error;
  }
}

async function synthesizeChunk(text: string): Promise<Buffer | null> {
  const request = {
    input: { text },
    voice: {
      languageCode: "en-US",
      name: "en-US-Chirp-HD-D",
      ssmlGender: "FEMALE" as const,
    },
    audioConfig: {
      audioEncoding: "MP3" as const,
      speakingRate: 0.9,
      pitch: 0,
      volumeGainDb: 2.0,
      sampleRateHertz: 24000,
      optimizeForTurnaround: true,
      effectsProfileId: ["headphone-class-device"],
    },
  };

  const [response] = await client.synthesizeSpeech(request);
  if (!response.audioContent) return null;

  if (response.audioContent instanceof Uint8Array) {
    return Buffer.from(response.audioContent.buffer);
  }
  return Buffer.from(response.audioContent);
}
