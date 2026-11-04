import { User } from "../../../domain/user";

export const LIST_USERS_USE_CASE = Symbol("LIST_USERS_USE_CASE");

export interface ListUsersPort {
  execute(): Promise<User[]>;
}
