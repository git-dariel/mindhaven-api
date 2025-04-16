import { S3Client } from "@aws-sdk/client-s3";

export const bucketName = process.env.AWS_BUCKET_NAME!;
const bucketRegion = process.env.AWS_REGION!;
const accessKey = process.env.AWS_ACCESS_KEY_ID!;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;

export const s3 = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
});
