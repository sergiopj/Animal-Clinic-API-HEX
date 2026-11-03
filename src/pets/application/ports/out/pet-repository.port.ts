import { Pet } from "../../../domain/pet";

export const PET_REPOSITORY = Symbol("PET_REPOSITORY");

export interface PetRepositoryPort {
  findAll(): Promise<Pet[]>;
  create(pet: Omit<Pet, "id">): Promise<Pet>;
  delete(id: string): Promise<boolean>;
}
