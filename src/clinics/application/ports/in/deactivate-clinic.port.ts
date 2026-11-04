import { Clinic } from "../../../domain/clinic";

export const DEACTIVATE_CLINIC_USE_CASE = Symbol(
  "DEACTIVATE_CLINIC_USE_CASE",
);

export interface DeactivateClinicUseCasePort {
  execute(id: string): Promise<Clinic | null>;
}

