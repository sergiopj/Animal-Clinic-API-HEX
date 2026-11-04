import { Clinic } from "../../../domain/clinic";

export const GET_ALL_CLINICS_USE_CASE = Symbol("GET_ALL_CLINICS_USE_CASE");

export interface GetAllClinicsUseCasePort {
  execute(ids?: string[]): Promise<Clinic[]>;
}

