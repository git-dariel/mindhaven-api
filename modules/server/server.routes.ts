import { Router } from "express";
import ServerController from "./server.controller.ts";

const router = Router();

router.get("/", ServerController.server.bind(ServerController));

export default router;
