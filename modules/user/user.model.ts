import z from "zod";

export const UserSchema = z.object({
  studentNumber: z.string(),
  firstName: z.string(),
  middleName: z.string().optional(),
  lastName: z.string(),
  userName: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  status: z.enum(["active", "inactive", "suspended", "deleted"]),
  profilePicture: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type User = z.infer<typeof UserSchema>;
