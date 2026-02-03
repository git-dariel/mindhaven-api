import { Router } from "express";
import TTSController from "./tts.controller";
import ServerController from "../server/server.controller";

const router = Router();

router.get("/", ServerController.server.bind(ServerController));
router.post("/synthesize", TTSController.synthesize.bind(TTSController));

export default router;
