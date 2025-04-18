import express, { Request, Response } from "express";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { bucketName, s3 } from "../helper/aws";
import multer from "multer";
import crypto from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import prisma from "../config/database";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

router.get("/get/file", async (req: Request, res: Response) => {
 try {
   const pictures = await prisma.user.findMany({orderBy: [{createdAt: "desc"}]})

   for(const picture of pictures) {
    if(picture.profilePicture){
      const getObjectParams = {
        Bucket: bucketName,
        Key: picture.profilePicture,
      }
     
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      picture.profilePicture = url;
    }
  }

  res.send(pictures);
 } catch (error) {
  console.error(error);
 }
})

router.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
  try {
    const imageName = randomImageName();
    const userId = req.body.userId;
    const params = {
      Bucket: bucketName,
      Key: imageName,
      Body: req.file?.buffer,
      ContentType: req.file?.mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        profilePicture: imageName,
        updatedAt: new Date(),
      },
    })

    res.status(200).json({
      message: "File uploaded successfully",
      fileName: randomImageName(),
      fileType: req.file?.mimetype,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});

export default router;
