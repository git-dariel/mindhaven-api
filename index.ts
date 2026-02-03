import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import ttsRoutes from "./modules/text-to-speech/tts.routes.ts";
import geminiRoutes from "./modules/gemini/gemini.routes.ts";
import serverRoutes from "./modules/server/server.routes.ts";
import conversationRoutes from "./modules/conversation/conversation.routes.ts";
import userRoutes from "./modules/user/user.routes.ts";
import { errorHandler } from "./shared/middleware/error.handler.ts";
import { config } from "./config/common.ts";
import prisma from "./config/database.ts";
import testUpload from "./test/test.upload.ts";

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
app.use("/api", serverRoutes);
app.use("/api/tts", ttsRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/conversation", conversationRoutes);
app.use("/api/user", userRoutes);
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
