import { ExternalIdentity, UserAccessContext } from "../../access-context";

export const RESOLVE_USER_ACCESS_CONTEXT_USE_CASE = Symbol(
    "RESOLVE_USER_ACCESS_CONTEXT_USE_CASE",
);

export interface ResolveUserAccessContextPort {
    execute(identity: ExternalIdentity): Promise<UserAccessContext | null>;
}