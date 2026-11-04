import { ExternalIdentity, UserAccessContext } from "../../access-context";

export const RESOLVE_USER_ACCESS_CONTEXT = Symbol(
    "RESOLVE_USER_ACCESS_CONTEXT",
);

export interface ResolveUserAccessContextPort {
    execute(identity: ExternalIdentity): Promise<UserAccessContext | null>;
}