export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export type Message = {
  content: string;
  role: MessageRole;
  createdAt?: Date;
};

export type Conversation = {
  id: string;
  userId?: string | null;
  title?: string | null;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  lastMessage: Date;
  isArchived: boolean;
};
