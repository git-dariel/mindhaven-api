import { User } from "../types/user.types";

export type SortOrder = "asc" | "desc";

export type SearchOptions = {
  query?: string;
  select?: (keyof User)[];
  match?: Partial<User>;
  sort?: {
    field: keyof User;
    order: SortOrder;
  };
  limit?: number;
  page?: number;
};
