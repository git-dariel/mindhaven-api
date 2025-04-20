import { Request, Response } from "express";
import UserService from "../services/user.service";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { bucketName, s3 } from "../helper/aws";
import { randomImageName } from "../helper/common";

const UserController = {
  getUser,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  uploadProfilePicture,
  deleteProfilePicture,
};

export default UserController;

/*
 * @desc   Get user by ID
 * @route  GET /api/user/:id
 * @access Private
 */
async function getUser(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await UserService.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Error getting user:", error);
    return res.status(500).json({
      error: "Failed to get user",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/*
 * @desc   Get all users
 * @route  GET /api/user
 * @access Private
 */
async function getAllUsers(_req: Request, res: Response) {
  try {
    const users = await UserService.getAllUsers();
    return res.json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    return res.status(500).json({
      error: "Failed to get users",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/*
 * @desc   Create new user
 * @route  POST /api/user
 * @access Private
 */
async function createUser(req: Request, res: Response) {
  try {
    const userData = req.body;

    if (!userData.email || !userData.password || !userData.userName) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    const user = await UserService.createUser(userData);
    return res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      error: "Failed to create user",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/*
 * @desc   Update user
 * @route  PUT /api/user/:id
 * @access Private
 */
async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await UserService.updateUser(id, updateData);
    return res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      error: "Failed to update user",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/*
 * @desc   Delete user
 * @route  DELETE /api/user/:id
 * @access Private
 */
async function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await UserService.deleteUser(id);
    return res.json(user);
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      error: "Failed to delete user",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/*
 * @desc   Search users
 * @route  POST /api/user/search
 * @access Private
 */
async function searchUsers(req: Request, res: Response) {
  try {
    const searchOptions = req.body;
    const users = await UserService.searchUsers(searchOptions);
    return res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    return res.status(500).json({
      error: "Failed to search users",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/*
 * @desc   Upload Profile Picture
 * @route  POST /api/user/upload
 * @access Private
 */
async function uploadProfilePicture(req: Request, res: Response) {
  try {
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const imageName = randomImageName();

    const params = {
      Bucket: bucketName,
      Key: imageName,
      Body: req.file?.buffer,
      ContentType: req.file?.mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    const user = await UserService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await UserService.updateUser(userId, {
      profilePicture: imageName,
      updatedAt: new Date(),
    });

    res.status(200).json({
      message: "File uploaded successfully",
      fileName: randomImageName(),
      fileType: req.file?.mimetype,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
}

/*
 * @desc   Delete Profile Picture
 * @route  POST /api/user/delete
 * @access Private
 */
async function deleteProfilePicture(req: Request, res: Response) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await UserService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const params = {
      Bucket: bucketName,
      Key: user.profilePicture,
    };

    const command = new DeleteObjectCommand(params);

    await s3.send(command);

    await UserService.updateUser(userId, {
      profilePicture: "",
      updatedAt: new Date(),
    });

    return res.status(200).json({
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete" });
  }
}
