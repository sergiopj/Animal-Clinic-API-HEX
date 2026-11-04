import { Pet } from "../../../domain/pet";

export const PET_REPOSITORY = Symbol("PET_REPOSITORY");

export interface PetRepositoryPort {
  findAll(clinicIds?: string[]): Promise<Pet[]>;
  getById(id: string, clinicIds?: string[]): Promise<Pet | null>;
  create(pet: Omit<Pet, "id">): Promise<Pet>;
  update(
    id: string,
    pet: Partial<Omit<Pet, "id">>,
    clinicIds?: string[],
  ): Promise<Pet | null>;
  delete(id: string, clinicIds?: string[]): Promise<boolean>;
}
