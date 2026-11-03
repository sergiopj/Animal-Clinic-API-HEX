import { Clinic } from "../../../domain/clinic";

export const CREATE_CLINIC_USE_CASE = Symbol("CREATE_CLINIC_USE_CASE");

export type CreateClinicData = Omit<Clinic, "id" | "status">;

export interface CreateClinicUseCasePort {
    execute(data: CreateClinicData): Promise<Clinic>;
}