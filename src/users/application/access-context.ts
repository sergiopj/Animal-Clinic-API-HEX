import { ClinicMembership, ClinicRole } from "../domain/clinic-membership";
import { PlatformRole, User } from "../domain/user";

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

export function isPlatformAdmin(
  context: UserAccessContext | null | undefined,
): boolean {
  return context?.user?.platformRole === PlatformRole.Admin;
}

export function isClinicAdmin(
  context: UserAccessContext | null | undefined,
  clinicId: string,
): boolean {
  if (isPlatformAdmin(context)) {
    return true;
  }
  return (
    context?.clinicMemberships.some(
      (m) => m.clinicId === clinicId && m.role === ClinicRole.Admin,
    ) ?? false
  );
}

export function isClinicMember(
  context: UserAccessContext | null | undefined,
  clinicId: string,
): boolean {
  if (isPlatformAdmin(context)) {
    return true;
  }
  return context?.clinicMemberships.some((m) => m.clinicId === clinicId) ?? false;
}

export function getAuthorizedClinicIds(
  context: UserAccessContext | null | undefined,
): string[] {
  if (!context) {
    return [];
  }
  return context.clinicMemberships.map((m) => m.clinicId);
}
