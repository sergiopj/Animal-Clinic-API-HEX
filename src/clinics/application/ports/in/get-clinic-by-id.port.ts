import { Clinic } from "../../../domain/clinic";

export const GET_CLINIC_BY_ID_USE_CASE = Symbol("GET_CLINIC_BY_ID_USE_CASE");

export interface GetClinicByIdUseCasePort {
  execute(id: string): Promise<Clinic | null>;
}

