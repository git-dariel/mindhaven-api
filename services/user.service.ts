import UserRepository from "../repositories/user.repository";
import { User, Status, CreateUserInput } from "../types/user.types";
import { SearchOptions } from "../types/search.types";

const UserService = {
  getUserById,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
};

export default UserService;

async function getUserById(id: string) {
  return await UserRepository.getUserById(id);
}

async function getAllUsers() {
  return await UserRepository.getAllUser();
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

async function updateUser(id: string, data: Partial<User>) {
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
