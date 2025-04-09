import prisma from "../config/database";

const ConversationRepository = {
  getConversationById,
  getAllConversations,
  createConversation,
  deleteConversation,
  searchConversation,
  updateConversation,
};

export default ConversationRepository;

/**
 * Find a conversation by its ID
 */
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

/**
 * Find all conversations, optionally filtered by userId
 */
async function getAllConversations(userId?: string, includeArchived: boolean = false) {
  try {
    return await prisma.conversation.findMany({
      where: {
        ...(userId ? { userId } : {}),
        isArchived: includeArchived ? undefined : false,
      },
      orderBy: {
        lastMessage: "desc",
      },
    });
  } catch (error) {
    console.error("Error finding all conversations:", error);
    throw error;
  }
}

/**
 * Create a new conversation with initial message
 */
async function createConversation(data: {
  userId?: string;
  title?: string;
  initialMessage: {
    content: string;
    role: string;
  };
}) {
  try {
    const now = new Date();
    return await prisma.conversation.create({
      data: {
        userId: data.userId || null,
        title: data.title || null,
        messages: [
          {
            content: data.initialMessage.content,
            role: data.initialMessage.role,
            createdAt: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
        lastMessage: now,
        isArchived: false,
      },
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
}

/**
 * Add a new message to an existing conversation
 */
async function updateConversation(
  conversationId: string,
  message: {
    content: string;
    role: string;
  }
) {
  try {
    const now = new Date();

    // First, get current conversation to access its messages
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Add the new message to the messages array
    const updatedMessages = [
      ...(conversation.messages || []),
      {
        content: message.content,
        role: message.role,
        createdAt: now,
      },
    ];

    return await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        messages: updatedMessages,
        lastMessage: now,
        updatedAt: now,
      },
    });
  } catch (error) {
    console.error("Error adding message to conversation:", error);
    throw error;
  }
}

/**
 * Soft delete a conversation by marking it as archived
 */
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

/**
 * Search conversations by title or message content, optionally filtered by userId
 */
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
