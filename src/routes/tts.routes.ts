import { Router } from "express";
import { ttsController } from "../controllers/tts.controller";

const router = Router();

router.post("/synthesize", ttsController.synthesize.bind(ttsController));

export default router;
