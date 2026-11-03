import { Clinic } from "../../../domain/clinic";

export const CLINIC_REPOSITORY = Symbol("CLINIC_REPOSITORY");

export interface ClinicRepositoryPort {
  create(clinic: Omit<Clinic, "id">): Promise<Clinic>;
}
