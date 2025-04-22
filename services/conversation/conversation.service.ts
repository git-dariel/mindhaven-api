import GeminiService from "../gemini/gemini.service";
import TTSService from "../text-to-speech/tts.service";
import { formatForTTS, extractInsertedId } from "../..//shared/helper/common";
import ConversationRepository from "./conversation.repository";
import { MessageRole, Message } from "./conversation.model";

const ConversationService = {
  generateSpeechResponse,
  generateSupportiveSpeechResponse,
  getConversationById,
  getAllConversations,
  createConversation,
  updateConversation,
  deleteConversation,
  searchConversations,
};

export default ConversationService;

async function getConversationById(id: string) {
  return await ConversationRepository.getConversationById(id);
}

async function getAllConversations(userId?: string, includeArchived: boolean = false) {
  try {
    const params = {
      userId,
      isArchived: includeArchived ? undefined : false,
      orderBy: { lastMessage: "desc" },
    };

    const conversations = await ConversationRepository.getAllConversations(params);

    return conversations;
  } catch (error) {
    console.error("Error getting all conversations:", error);
    throw error;
  }
}

async function createConversation(data: {
  userId?: string;
  title?: string;
  messages?: {
    content: string;
    role: MessageRole;
    createdAt?: Date;
  }[];
}) {
  return await ConversationRepository.createConversation({
    userId: data.userId,
    title: data.title,
    messages: data.messages || [],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastMessage: new Date(),
    isArchived: false,
  });
}

async function updateConversation(
  conversationId: string,
  message: { content: string; role: MessageRole }
) {
  try {
    const now = new Date();

    const conversation = await ConversationRepository.getConversationById(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const existingMessages = (conversation.messages || []) as Message[];
    const newMessage: Message = {
      content: message.content,
      role: message.role,
      createdAt: now,
    };

    const updatedMessages: Message[] = [...existingMessages, newMessage];

    return await ConversationRepository.updateConversation(conversationId, {
      messages: updatedMessages,
      lastMessage: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error("Error updating conversation:", error);
    throw error;
  }
}

async function deleteConversation(id: string) {
  return await ConversationRepository.deleteConversation(id);
}

async function searchConversations(query: string, userId?: string) {
  return await ConversationRepository.searchConversation(query, userId);
}

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
      messages: [
        {
          content: prompt,
          role: MessageRole.USER,
          createdAt: new Date(),
        },
      ],
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
    await ConversationService.updateConversation(conversationId, {
      content: textResponse,
      role: MessageRole.ASSISTANT,
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
        messages: [
          {
            content: input,
            role: MessageRole.USER,
            createdAt: new Date(),
          },
        ],
      });

      const conversationId = extractInsertedId(conversationResult);

      // Add the assistant's response
      await ConversationService.updateConversation(conversationId, {
        content: textResponse,
        role: MessageRole.ASSISTANT,
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
