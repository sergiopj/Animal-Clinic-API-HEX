import { ExternalIdentity, UserAccessContext } from "../../access-context";

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

export interface UserRepositoryPort {
    findAccessContextByIdentity(identity: ExternalIdentity): Promise<UserAccessContext | null>;
}
