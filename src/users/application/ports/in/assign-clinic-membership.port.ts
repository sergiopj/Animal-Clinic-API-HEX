import {
  ClinicMembership,
  ClinicRole,
} from "../../../domain/clinic-membership";

export const ASSIGN_CLINIC_MEMBERSHIP_USE_CASE = Symbol(
  "ASSIGN_CLINIC_MEMBERSHIP_USE_CASE",
);

export interface AssignClinicMembershipCommand {
  clinicId: string;
  userId?: string;
  issuer?: string;
  subject?: string;
  role: ClinicRole;
}

export interface AssignClinicMembershipPort {
  execute(command: AssignClinicMembershipCommand): Promise<ClinicMembership>;
  execute(
    clinicId: string,
    userIdOrIdentity: string | { issuer: string; subject: string },
    role: ClinicRole,
  ): Promise<ClinicMembership>;
}
