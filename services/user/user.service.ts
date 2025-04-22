import UserRepository from "./user.repository";
import { Status, CreateUserInput } from "./user.model";
import { SearchOptions } from "../../shared/types/search.types";
import { bucketName, s3 } from "../../shared/helper/aws";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";

const UserService = {
  getUserById,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
};

export default UserService;

// TODO: Also implement the get signed URL for the profile picture
async function getUserById(id: string) {
  return await UserRepository.getUserById(id);
}

async function getAllUsers() {
  const users = await UserRepository.getAllUser();

  for (const user of users) {
    if (user.profilePicture) {
      const getObjectParams = {
        Bucket: bucketName,
        Key: user.profilePicture,
      };

      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      user.profilePicture = url;
    }
  }

  return users;
}

async function createUser(data: CreateUserInput) {
  // Set default values for new users
  const userData = {
    ...data,
    status: "active" as Status,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return await UserRepository.createUser(userData);
}

async function updateUser(id: string, data: Partial<CreateUserInput>) {
  const updateData = {
    ...data,
    updatedAt: new Date(),
  };

  return await UserRepository.updateUser(id, updateData);
}

async function deleteUser(id: string) {
  return await UserRepository.deleteUser(id);
}

async function searchUsers(options: Partial<SearchOptions>) {
  const searchOptions: SearchOptions = {
    query: options.query,
    select: options.select,
    match: options.match,
    sort: options.sort || { field: "createdAt", order: "desc" },
    limit: Number(options.limit) || 10,
    page: Number(options.page) || 1,
  };

  return await UserRepository.searchUser(searchOptions);
}
