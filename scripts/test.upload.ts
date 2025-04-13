import express from "express";
import multer from "multer";
import { uploadFile } from "../services/s3.service";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // temp local storage

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file?.path!;
    const fileName = `uploads/${Date.now()}_${req.file?.originalname}`;

    const result = await uploadFile(filePath, fileName);
    res.json({ message: "Upload successful", url: result.Location });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});

export default router;
