import { Router } from "express";
import GeminiController from "../controllers/gemini.controller";

const router = Router();

router.post("/generate", GeminiController.generateResponse);
router.post("/support", GeminiController.generateSupportiveResponse);

export default router;
