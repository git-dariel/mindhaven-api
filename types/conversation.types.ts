export type Message = {
  content: string;
  role: string;
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
