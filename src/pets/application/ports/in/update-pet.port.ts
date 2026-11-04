import { Pet } from "../../../domain/pet";

export const UPDATE_PET_USE_CASE = Symbol("UPDATE_PET_USE_CASE");

export interface UpdatePetUseCasePort {
  execute(
    id: string,
    pet: Partial<Omit<Pet, "id">>,
    clinicIds?: string[],
  ): Promise<Pet | null>;
}
