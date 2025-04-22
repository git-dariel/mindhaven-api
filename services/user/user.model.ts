export type Status = "active" | "inactive" | "suspended" | "deleted";

export type User = {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  userName: string;
  email: string;
  status: Status;
  profilePicture?: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

// Type for creating a new user with required and optional fields clearly defined
export type CreateUserInput = {
  studentNumber: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  status: Status;
  middleName?: string;
  profilePicture?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
