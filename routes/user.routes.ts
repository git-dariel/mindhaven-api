import { Router } from "express";
import UserController from "../controllers/user.controller";

const router = Router();

// User management routes
router.get("/get/all", UserController.getAllUsers);
router.post("/search", UserController.searchUsers);
router.get("/get/:id", UserController.getUser);
router.post("/create", UserController.createUser);
router.put("/update/:id", UserController.updateUser);
router.delete("/delete/:id", UserController.deleteUser);

export default router;
