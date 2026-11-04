import {
  ClinicMembership,
  ClinicRole,
} from "../../../domain/clinic-membership";

export const UPDATE_CLINIC_MEMBERSHIP_ROLE_USE_CASE = Symbol(
  "UPDATE_CLINIC_MEMBERSHIP_ROLE_USE_CASE",
);

export interface UpdateClinicMembershipRolePort {
  execute(
    clinicId: string,
    userId: string,
    role: ClinicRole,
  ): Promise<ClinicMembership | null>;
}
