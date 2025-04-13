import s3 from "../helper/aws";
import { ManagedUpload } from "aws-sdk/clients/s3";
import fs from "fs";

export const uploadFile = async (
  filePath: string,
  fileName: string
): Promise<ManagedUpload.SendData> => {
  const fileStream = fs.createReadStream(filePath);

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileName,
    Body: fileStream,
  };

  return s3.upload(uploadParams).promise();
};
