import { Request, Response } from "express";
import ConversationService from "../services/conversation.service";

const ConversationController = {
  generateSpeechResponse,
  generateSupportiveSpeechResponse,
  getConversation,
  getAllConversations,
  deleteConversation,
  searchConversations,
};

export default ConversationController;

/*
 * @desc   get by id conversation
 * @route  GET /api/conversation/get/:id
 * @access Private
 */
async function getConversation(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Conversation ID is required" });
    }

    const conversation = await ConversationService.getConversationById(id);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    return res.json(conversation);
  } catch (error) {
    console.error("Error getting conversation:", error);
    return res.status(500).json({
      error: "Failed to get conversation",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/*
 * @desc   get all conversation
 * @route  GET /api/conversation/get/all
 * @access Private
 */
async function getAllConversations(req: Request, res: Response) {
  try {
    const { userId, includeArchived } = req.query;
    const conversations = await ConversationService.getAllConversations(
      userId as string | undefined,
      includeArchived === "true"
    );
    return res.json(conversations);
  } catch (error) {
    console.error("Error getting conversations:", error);
    return res.status(500).json({
      error: "Failed to get conversations",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/*
 * @desc   delete conversation
 * @route  GET /api/conversation/delete/:id
 * @access Private
 */
async function deleteConversation(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Conversation ID is required" });
    }

    const conversation = await ConversationService.deleteConversation(id);
    return res.json(conversation);
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return res.status(500).json({
      error: "Failed to delete conversation",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/*
 * @desc   search conversation
 * @route  GET /api/conversation/search
 * @access Private
 */
async function searchConversations(req: Request, res: Response) {
  try {
    const { query, userId } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const conversations = await ConversationService.searchConversations(
      query as string,
      userId as string | undefined
    );
    return res.json(conversations);
  } catch (error) {
    console.error("Error searching conversations:", error);
    return res.status(500).json({
      error: "Failed to search conversations",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/*
 * @desc   create normal conversation
 * @route  GET /api/conversation/create/normal
 * @access Private
 */
async function generateSpeechResponse(req: Request, res: Response) {
  try {
    const { prompt } = req.body;
    const { userId } = req.query;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const { text, audio, isTruncated, conversationId } =
      await ConversationService.generateSpeechResponse(prompt, userId as string | undefined);

    if (!audio || !(audio instanceof Buffer)) {
      throw new Error("Invalid audio content received");
    }

    // Set response headers for audio streaming
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audio.length,
      "Content-Disposition": "attachment; filename=response.mp3",
      "X-Response-Text": Buffer.from(text).toString("base64"),
      "X-Response-Truncated": isTruncated ? "true" : "false",
      "X-Conversation-Id": conversationId,
    });

    return res.send(audio);
  } catch (error) {
    console.error("Error in conversation controller:", error);
    return res.status(500).json({
      error: "Failed to generate speech response",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/*
 * @desc   create supportive conversation
 * @route  GET /api/conversation/create/supportive
 * @access Private
 */
async function generateSupportiveSpeechResponse(req: Request, res: Response) {
  try {
    const { input } = req.body;
    const { userId } = req.query;

    if (!input) {
      return res.status(400).json({ error: "Input text is required" });
    }

    const { text, audio, isTruncated, conversationId } =
      await ConversationService.generateSupportiveSpeechResponse(
        input,
        userId as string | undefined
      );

    if (!audio || !(audio instanceof Buffer)) {
      throw new Error("Invalid audio content received");
    }

    // Set response headers for audio streaming
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audio.length,
      "Content-Disposition": "attachment; filename=response.mp3",
      "X-Response-Text": Buffer.from(text).toString("base64"),
      "X-Response-Truncated": isTruncated ? "true" : "false",
      "X-Conversation-Id": conversationId,
    });

    return res.send(audio);
  } catch (error) {
    console.error("Error in supportive conversation controller:", error);
    return res.status(500).json({
      error: "Failed to generate supportive speech response",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
