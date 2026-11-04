import { ClinicMembership } from "../../../domain/clinic-membership";

export const LIST_CLINIC_MEMBERSHIPS_USE_CASE = Symbol(
  "LIST_CLINIC_MEMBERSHIPS_USE_CASE",
);

export interface ListClinicMembershipsPort {
  execute(clinicId: string): Promise<ClinicMembership[]>;
}
