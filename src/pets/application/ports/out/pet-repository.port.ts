import { Pet } from "../../../domain/pet";

export const PET_REPOSITORY = Symbol("PET_REPOSITORY");

export interface PetRepositoryPort {
  findAll(): Promise<Pet[]>;
  getById(id: string): Promise<Pet | null>;
  create(pet: Omit<Pet, "id">): Promise<Pet>;
  update(id: string, pet: Omit<Pet, "id">): Promise<Pet | null>;
  delete(id: string): Promise<boolean>;
}
