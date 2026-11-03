import { Pet } from "../../../domain/pet";

export const CREATE_PET_USE_CASE = Symbol("CREATE_PET_USE_CASE");
export interface CreatePetUseCasePort {
    execute(pet: Omit<Pet, "id">): Promise<Pet>;
}
