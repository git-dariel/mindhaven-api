// import { ManagedUpload } from "aws-sdk/clients/s3";
// import fs from "fs";
// import mime from "mime-types";
// import s3 from "../helper/aws";

// const CLOUD_FRONT_URL = process.env.CLOUDFRONT_URL!;

// export const uploadFile = async (
//   filePath: string,
//   fileName: string
// ): Promise<{ url: string; s3Response: ManagedUpload.SendData }> => {
//   const fileStream = fs.createReadStream(filePath);
//   const contentType = mime.lookup(filePath) || "application/octet-stream";
//   const isViewableType = /\.(jpg|jpeg|png|gif|webp|pdf)$/i.test(fileName);
//   const contentDisposition = isViewableType ? "inline" : "attachment";

//   const uploadParams = {
//     Bucket: process.env.AWS_BUCKET_NAME!,
//     Key: `uploads/${fileName}`,
//     Body: fileStream,
//     ContentType: contentType,
//     CacheControl: "max-age=31536000, public",
//     ACL: "private",
//     "Content-Disposition": contentDisposition,
//     Metadata: {
//       "original-filename": fileName,
//       "content-type": contentType,
//       "is-viewable": isViewableType.toString(),
//     },
//   };

//   const s3Response = await s3.upload(uploadParams).promise();
//   const cloudFrontUrl = `${CLOUD_FRONT_URL}/uploads/${fileName}`;

//   return {
//     url: cloudFrontUrl,
//     s3Response,
//   };
// };
