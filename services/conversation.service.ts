import GeminiService from "./gemini.service";
import TTSService from "./tts.service";
import { formatForTTS, extractInsertedId } from "../helper/common";
import ConversationRepository from "../repositories/conversation.repository";

const ConversationService = {
  generateSpeechResponse,
  generateSupportiveSpeechResponse,
  getConversationById,
  getAllConversations,
  createConversation,
  deleteConversation,
  searchConversations,
};

export default ConversationService;

/**
 * Get a conversation by ID with all messages
 */
async function getConversationById(id: string) {
  return await ConversationRepository.getConversationById(id);
}

/**
 * Get all conversations, optionally filtered by userId
 */
async function getAllConversations(userId?: string, includeArchived: boolean = false) {
  return await ConversationRepository.getAllConversations(userId, includeArchived);
}

/**
 * Create a new conversation
 */
async function createConversation(data: {
  userId?: string;
  title?: string;
  initialMessage: {
    content: string;
    role: string;
  };
}) {
  return await ConversationRepository.createConversation(data);
}

/**
 * Delete a conversation (soft delete)
 */
async function deleteConversation(id: string) {
  return await ConversationRepository.deleteConversation(id);
}

/**
 * Search conversations
 */
async function searchConversations(query: string, userId?: string) {
  return await ConversationRepository.searchConversation(query, userId);
}

/**
 * Generates a spoken response using Gemini and TTS in parallel
 */
async function generateSpeechResponse(prompt: string, userId?: string) {
  try {
    // Generate a title based on the user's prompt
    const titlePromise = GeminiService.generateConversationTitle(prompt);

    // Get the text response from Gemini (start this early)
    const textResponsePromise = GeminiService.generateResponse(prompt);

    // Wait for the title to be generated
    const title = await titlePromise;

    // Create a conversation with the user's input and generated title
    const conversationResult = await ConversationRepository.createConversation({
      userId,
      title,
      initialMessage: {
        content: prompt,
        role: "user",
      },
    });

    // Extract the conversation ID
    const conversationId = extractInsertedId(conversationResult);

    // Wait for the text response
    const textResponse = await textResponsePromise;
    if (!textResponse || typeof textResponse !== "string") {
      throw new Error("Failed to generate text response");
    }

    // Format the response for TTS while preserving paragraphs
    const formattedText = formatForTTS(textResponse);

    // Start TTS conversion immediately after formatting
    const audioPromise = TTSService.synthesizeSpeech(formattedText);

    // Wait for audio conversion to complete
    const audioContent = await audioPromise;

    // Add the assistant's response as a new message
    await ConversationRepository.updateConversation(conversationId, {
      content: textResponse,
      role: "assistant",
    });

    return {
      text: textResponse,
      audio: audioContent,
      isTruncated: formattedText.length < textResponse.length,
      conversationId: conversationId,
    };
  } catch (error) {
    console.error("Error generating speech response:", error);
    throw error;
  }
}

/**
 * Generates a mental health focused spoken response with parallel processing
 * and stores the conversation with both user input and assistant response
 */
async function generateSupportiveSpeechResponse(input: string, userId?: string) {
  try {
    // Start all async operations in parallel immediately
    const titlePromise = GeminiService.generateConversationTitle(input);
    const textResponsePromise = GeminiService.generateSupportiveResponse(input);

    // Wait for text response first since we need it for audio
    const textResponse = await textResponsePromise;
    if (!textResponse || typeof textResponse !== "string") {
      throw new Error("Failed to generate supportive response");
    }

    // Format and start TTS immediately after getting text
    const formattedText = formatForTTS(textResponse);
    const audioPromise = TTSService.synthesizeSpeech(formattedText);

    // Handle conversation creation in parallel with audio generation
    const [title, audioContent] = await Promise.all([titlePromise, audioPromise]);

    // Create conversation after we have audio (non-blocking for response)
    const conversationPromise = (async () => {
      const conversationResult = await ConversationRepository.createConversation({
        userId,
        title,
        initialMessage: {
          content: input,
          role: "user",
        },
      });

      const conversationId = extractInsertedId(conversationResult);

      // Add the assistant's response
      await ConversationRepository.updateConversation(conversationId, {
        content: textResponse,
        role: "assistant",
      });

      return conversationId;
    })();

    // Get conversation ID but don't block audio return
    const conversationId = await conversationPromise;

    return {
      text: textResponse,
      audio: audioContent,
      isTruncated: formattedText.length < textResponse.length,
      conversationId: conversationId,
    };
  } catch (error) {
    console.error("Error generating supportive speech response:", error);
    throw error;
  }
}
