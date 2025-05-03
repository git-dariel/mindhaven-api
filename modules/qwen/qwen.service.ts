import { MENTAL_HEALTH_GUIDELINES } from "../../config/common";
import { cleanResponseText } from "../../shared/helper/common";
import openai from "../../shared/utils/llm.utils";

type Role = "user" | "assistant" | "system";

const QwenService = {
  generateSupportiveResponse,
  generateConversationTitle,
};

export default QwenService;

async function generateSupportiveResponse(prompt: string, role: Role = "user") {
  try {
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    const completion = await openai.chat.completions.create({
      model: "qwen/qwen3-4b:free",
      messages: [
        {
          role: role,
          content: `${MENTAL_HEALTH_GUIDELINES}\n\nUser: ${prompt}\n\nProvide a brief empathetic response with one clear suggestion`,
        },
      ],
      temperature: 0.6,
      top_p: 0.8,
      max_tokens: 150,
      presence_penalty: 0.1,
    });

    if (!completion?.choices?.[0]?.message?.content) {
      console.error("Invalid API response structure:", completion);
      throw new Error("Invalid response from AI model");
    }

    return cleanResponseText(completion.choices[0].message.content);
  } catch (error) {
    console.error("Error generating supportive response:", error);
    throw new Error("Failed to generate supportive response");
  }
}

async function generateConversationTitle(message: string) {
  try {
    if (!message) {
      return "New Conversation";
    }

    const completion = await openai.chat.completions.create({
      model: "qwen/qwen3-4b:free",
      messages: [
        {
          role: "system",
          content: `Generate a very concise title (maximum 5 words) that captures the essence of this message. The title should be brief and descriptive without any quotation marks or punctuation: ${message}`,
        },
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    if (!completion?.choices?.[0]?.message?.content) {
      console.error("Invalid API response structure:", completion);
      return "New Conversation";
    }

    const title = cleanResponseText(completion.choices[0].message.content);
    return title.length > 50 ? title.substring(0, 47) + "..." : title;
  } catch (error) {
    console.error("Error generating conversation title:", error);
    return "New Conversation";
  }
}
