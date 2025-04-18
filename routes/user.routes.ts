import { Router } from "express";
import UserController from "../controllers/user.controller";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();

// User management routes
router.get("/get/all", UserController.getAllUsers);
router.post("/search", UserController.searchUsers);
router.get("/get/:id", UserController.getUser);
router.post("/create", UserController.createUser);
router.put("/update/:id", UserController.updateUser);
router.delete("/delete/:id", UserController.deleteUser);
router.post("/upload", upload.single("file"), UserController.uploadProfilePicture);

export default router;
