import z from "zod";

export const MessageSchema = z.object({
  content: z.string(),
  role: z.enum(["user", "assistant"]),
  createdAt: z.date().optional(),
});

export type Message = z.infer<typeof MessageSchema>;

export const Conversation = z.object({
  id: z.string().optional(),
  userId: z.string().nullable().optional(),
  title: z.string().optional(),
  messages: z.array(MessageSchema),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  lastMessage: z.date().optional(),
  isArchived: z.boolean().optional(),
});

export type Conversation = z.infer<typeof Conversation>;
