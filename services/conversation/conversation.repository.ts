import { Conversation } from "./conversation.model";
import prisma from "../../config/database";

const ConversationRepository = {
  getConversationById,
  getAllConversations,
  createConversation,
  deleteConversation,
  searchConversation,
  updateConversation,
};

export default ConversationRepository;

async function getConversationById(id: string) {
  try {
    return await prisma.conversation.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Error finding conversation by ID:", error);
    throw error;
  }
}

async function getAllConversations(params: {
  userId?: string;
  isArchived?: boolean;
  orderBy?: { [key: string]: string };
}) {
  try {
    return await prisma.conversation.findMany({
      where: params.userId
        ? {
            userId: params.userId,
            isArchived: params.isArchived,
          }
        : {
            isArchived: params.isArchived,
          },
      orderBy: params.orderBy,
    });
  } catch (error) {
    console.error("Error finding all conversations:", error);
    throw error;
  }
}

async function createConversation(data: Partial<Conversation>) {
  try {
    return await prisma.conversation.create({
      data,
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
}

async function updateConversation(id: string, data: Partial<Conversation>) {
  try {
    return await prisma.conversation.update({
      where: { id },
      data,
    });
  } catch (error) {
    console.error("Error adding message to conversation:", error);
    throw error;
  }
}

async function deleteConversation(id: string) {
  try {
    return await prisma.conversation.update({
      where: { id },
      data: {
        isArchived: true,
      },
    });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    throw error;
  }
}

async function searchConversation(query: string, userId?: string) {
  try {
    return await prisma.conversation.findMany({
      where: {
        ...(userId ? { userId } : {}),
        isArchived: false,
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            messages: {
              some: {
                content: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      },
      orderBy: {
        lastMessage: "desc",
      },
    });
  } catch (error) {
    console.error("Error searching conversations:", error);
    throw error;
  }
}
