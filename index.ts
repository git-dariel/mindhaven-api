import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import modules from "./modules/app.module";
import { errorHandler } from "./shared/middleware/errorHandler";
import { config } from "./config/common";
import prisma from "./config/database";
import testUpload from "./test/test.upload";

const app = express();
const port = process.env.PORT || config.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Routes
app.use("/api", modules.serverRoutes);
app.use("/api/tts", modules.ttsRoutes);
app.use("/api/gemini", modules.geminiRoutes);
app.use("/api/conversation", modules.conversationRoutes);
app.use("/api/user", modules.userRoutes);
app.use("/api/test", testUpload);

// Error handling
app.use(errorHandler);

async function connectDB() {
  try {
    await prisma.$connect();
    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  }
}

app.listen(port, async () => {
  await connectDB();
  console.log(`Server is running on port ${port}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
