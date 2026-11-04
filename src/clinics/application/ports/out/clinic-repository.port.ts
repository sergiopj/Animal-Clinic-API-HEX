import { Clinic, ClinicStatus } from "../../../domain/clinic";

export const CLINIC_REPOSITORY = Symbol("CLINIC_REPOSITORY");

export interface ClinicRepositoryPort {
  create(clinic: Omit<Clinic, "id">): Promise<Clinic>;
  findAll(): Promise<Clinic[]>;
  findById(id: string): Promise<Clinic | null>;
  findByIds(ids: string[]): Promise<Clinic[]>;
  update(
    id: string,
    clinic: Partial<Omit<Clinic, "id">>,
  ): Promise<Clinic | null>;
  updateStatus(id: string, status: ClinicStatus): Promise<Clinic | null>;
}
