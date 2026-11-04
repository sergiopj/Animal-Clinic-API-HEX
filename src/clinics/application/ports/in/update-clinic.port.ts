import { Clinic } from "../../../domain/clinic";

export const UPDATE_CLINIC_USE_CASE = Symbol("UPDATE_CLINIC_USE_CASE");

export interface UpdateClinicUseCasePort {
  execute(
    id: string,
    data: Partial<Omit<Clinic, "id">>,
  ): Promise<Clinic | null>;
}

