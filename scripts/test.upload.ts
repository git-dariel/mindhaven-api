import express, { Request, Response } from "express";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { bucketName, s3 } from "../helper/aws";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
  try {
    console.log("req.body", req.body);
    console.log("req.file", req.file);

    req.file?.buffer;

    const params = {
      Bucket: bucketName,
      Key: req.file?.originalname,
      Body: req.file?.buffer,
      ContentType: req.file?.mimetype,
    };

    const command = new PutObjectCommand(params);

    await s3.send(command);

    return res.status(200).json({
      message: "File uploaded successfully",
      fileName: req.file?.originalname,
      fileType: req.file?.mimetype,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});

export default router;
