import { UserAccessContext } from "../users/application/access-context";

export interface AuthenticatedUser {
  subject: string;
  issuer: string;
  scopes: string[];
  accessContext?: UserAccessContext | null;
}
