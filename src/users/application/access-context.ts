import { ClinicMembership } from "../domain/clinic-membership";
import { User } from "../domain/user";

/** Identity claims returned by authentication after the access token is validated. */
export interface ExternalIdentity {
    /** Token issuer; part of the stable external identity key. */
    issuer: string;
    /** Auth0 subject; use with issuer to find the local account, not email. */
    subject: string;
}

/** Local account and trusted clinic memberships used for authorization. */
export interface UserAccessContext {
    user: User;
    clinicMemberships: ClinicMembership[];
}