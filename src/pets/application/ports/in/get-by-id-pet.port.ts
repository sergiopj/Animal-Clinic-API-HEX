import { Pet } from "../../../domain/pet";

export const GET_BY_ID_PET_USE_CASE = Symbol("GET_BY_ID_PET_USE_CASE");

export interface GetByIdPetUseCasePort {
  execute(id: string, clinicIds?: string[]): Promise<Pet | null>;
}
