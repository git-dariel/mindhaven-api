import conversationRoutes from "./conversation/conversation.routes";
import geminiRoutes from "./gemini/gemini.routes";
import serverRoutes from "./server/server.routes";
import ttsRoutes from "./text-to-speech/tts.routes";
import userRoutes from "./user/user.routes";

const modules = {
  conversationRoutes,
  geminiRoutes,
  serverRoutes,
  ttsRoutes,
  userRoutes,
};

export default modules;
