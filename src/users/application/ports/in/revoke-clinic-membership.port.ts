export const REVOKE_CLINIC_MEMBERSHIP_USE_CASE = Symbol(
  "REVOKE_CLINIC_MEMBERSHIP_USE_CASE",
);

export interface RevokeClinicMembershipPort {
  execute(clinicId: string, userId: string): Promise<boolean>;
}

