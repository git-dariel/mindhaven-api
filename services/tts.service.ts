import { client } from "../helper/tts.helper";
import NodeCache from "node-cache";
import { config } from "../config/common";

// Initialize cache with 1 hour TTL and check period of 600 seconds
const ttsCache = new NodeCache({
  stdTTL: 3600,
  checkperiod: 600,
  useClones: false,
});

const TTSService = {
  synthesizeSpeech,
};

export default TTSService;

async function synthesizeSpeech(text: string) {
  try {
    // Check cache first
    const cacheKey = Buffer.from(text).toString("base64");
    const cachedAudio = ttsCache.get(cacheKey);
    if (cachedAudio) {
      return cachedAudio;
    }

    // Split long text into chunks for parallel processing
    const chunks = splitIntoChunks(text);

    // Process all chunks in parallel
    const audioPromises = chunks.map((chunk) => synthesizeChunk(chunk));
    const audioContents = await Promise.all(audioPromises);

    // Filter out any null values and combine audio contents
    const validAudioContents = audioContents.filter(
      (content): content is Buffer => content !== null
    );
    const combinedAudio = Buffer.concat(validAudioContents);

    // Cache the result
    ttsCache.set(cacheKey, combinedAudio);

    return combinedAudio;
  } catch (error) {
    console.error("Error synthesizing speech:", error);
    throw error;
  }
}

function splitIntoChunks(text: string): string[] {
  const words = text.split(" ");
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentLength = 0;

  for (const word of words) {
    if (currentLength + word.length > config.MAX_CHUNK_LENGTH) {
      chunks.push(currentChunk.join(" "));
      currentChunk = [word];
      currentLength = word.length;
    } else {
      currentChunk.push(word);
      currentLength += word.length;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }

  return chunks;
}

async function synthesizeChunk(text: string): Promise<Buffer | null> {
  const request = {
    input: { text },
    voice: {
      languageCode: "en-US",
      name: "en-US-Chirp-HD-F",
      ssmlGender: "FEMALE" as const,
    },
    audioConfig: {
      audioEncoding: "MP3" as const,
      effectsProfileId: ["headphone-class-device"],
      speakingRate: 1.0,
      pitch: 0,
      volumeGainDb: 2.0,
      sampleRateHertz: 16000,
      optimizeForTurnaround: true,
    },
  };

  const [response] = await client.synthesizeSpeech(request);
  if (!response.audioContent) return null;

  // Handle both Uint8Array and string types
  if (response.audioContent instanceof Uint8Array) {
    return Buffer.from(response.audioContent.buffer);
  }
  return Buffer.from(response.audioContent);
}
