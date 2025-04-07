import { Router } from "express";
import ServerController from "../controllers/server.controller";

const router = Router();

router.get("/", ServerController.server.bind(ServerController));

export default router;
