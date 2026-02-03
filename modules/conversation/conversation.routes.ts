import { Router } from "express";
import ConversationController from "./conversation.controller";

const router = Router();

// Speech generation routes
router.post("/create/normal", ConversationController.generateSpeechResponse);
router.post("/create/supportive", ConversationController.generateSupportiveSpeechResponse);

// Conversation management routes
router.get("/get/all", ConversationController.getAllConversations);
router.get("/search", ConversationController.searchConversations);
router.get("/get/:id", ConversationController.getConversation);
router.delete("/delete/:id", ConversationController.deleteConversation);

export default router;
