import { Router } from "express";
import ConversationController from "../controllers/conversation.controller";

const router = Router();

router.post("/chat", ConversationController.generateSpeechResponse);
router.post("/support-chat", ConversationController.generateSupportiveSpeechResponse);

export default router;
