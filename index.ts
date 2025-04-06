import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import ttsRoutes from "./routes/tts.routes";
import geminiRoutes from "./routes/gemini.routes";
import serverRoutes from "./routes/server.routes";
import conversationRoutes from "./routes/conversation.routes";
import { config } from "./config/common";

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

// Error handling
app.use((err: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
