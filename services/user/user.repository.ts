import { User } from "./user.model";
import { SearchOptions } from "../../shared/types/search.types";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const UserRepository = {
  getUserById,
  getAllUser,
  createUser,
  deleteUser,
  searchUser,
  updateUser,
};

export default UserRepository;

async function getUserById(id: string) {
  try {
    return await prisma.user.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Error finding user by ID:", error);
    throw error;
  }
}

async function getAllUser() {
  try {
    return await prisma.user.findMany({ orderBy: [{ createdAt: "desc" }] });
  } catch (error) {
    console.error("Error finding all users:", error);
    throw error;
  }
}

async function createUser(data: User) {
  try {
    return await prisma.user.create({
      data: {
        ...data,
        profilePicture: data.profilePicture ?? "",
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

async function updateUser(id: string, data: Partial<User>) {
  try {
    return await prisma.user.update({
      where: { id },
      data: data,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

async function deleteUser(id: string) {
  try {
    return await prisma.user.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

async function searchUser(options: SearchOptions) {
  try {
    const {
      query,
      select,
      match,
      sort = { field: "createdAt", order: "desc" },
      limit = 10,
      page = 1,
    } = options;

    const skip = (page - 1) * limit;
    const pipeline: any[] = [];

    // Add search stage if query exists
    if (query) {
      pipeline.push({
        $search: {
          index: "default",
          compound: {
            should: [
              {
                text: {
                  query: query,
                  path: ["firstName", "lastName", "email", "userName", "studentNumber"],
                  fuzzy: {
                    maxEdits: 2,
                    prefixLength: 1,
                  },
                },
              },
            ],
          },
        },
      });
    }

    // Add match stage for exact matches and status
    const matchStage: any = { status: { $ne: "deleted" } };
    if (match) {
      Object.keys(match).forEach((key) => {
        matchStage[key] = match[key as keyof User];
      });
    }
    pipeline.push({ $match: matchStage });

    // Add sort stage
    pipeline.push({
      $sort: {
        [sort.field]: sort.order === "asc" ? 1 : -1,
      },
    });

    // Get total count before pagination
    const countPipeline = [...pipeline, { $count: "total" }];

    // Add pagination stages
    pipeline.push({ $skip: skip }, { $limit: limit });

    // Add field selection if specified
    if (select) {
      const projection: Record<string, 1> = {};
      select.forEach((field) => {
        projection[field] = 1;
      });
      pipeline.push({ $project: projection });
    }

    // Execute both pipelines
    const [countResult, users] = await Promise.all([
      prisma.user.aggregateRaw({
        pipeline: countPipeline,
      }),
      prisma.user.aggregateRaw({
        pipeline: pipeline,
      }),
    ]);

    // Safely handle the MongoDB aggregation result
    const count =
      Array.isArray(countResult) && countResult.length > 0
        ? (countResult[0] as { total: number }).total
        : 0;

    return {
      data: users,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
}
