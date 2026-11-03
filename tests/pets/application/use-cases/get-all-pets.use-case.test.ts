import { describe, expect, it, jest } from "@jest/globals";
import { GetAllPetsUseCase } from "../../../../src/pets/application/use-cases/get-all-pets.use-case";
import { Gender, Pet, Species } from "../../../../src/pets/domain/pet";
import { PetRepositoryPort } from "../../../../src/pets/application/ports/out/pet-repository.port";

describe("GetAllPetsUseCase", () => {
  it("returns pets from the repository", async () => {
    const pets: Pet[] = [
      {
        id: "pet-1",
        name: "Luna",
        species: Species.Cat,
        gender: Gender.Female,
        birthdate: "2020-05-10",
      },
    ];
    const petRepository: PetRepositoryPort = {
      findAll: jest.fn<() => Promise<Pet[]>>().mockResolvedValue(pets),
      getById: jest.fn<(id: string) => Promise<Pet | null>>(),
      create: jest.fn<(pet: Omit<Pet, "id">) => Promise<Pet>>(),
      update: jest.fn<
        (id: string, pet: Omit<Pet, "id">) => Promise<Pet | null>
      >(),
      delete: jest.fn<(id: string) => Promise<boolean>>(),
    };
    const useCase = new GetAllPetsUseCase(petRepository);

    const result = await useCase.execute();

    expect(result).toEqual(pets);
    expect(petRepository.findAll).toHaveBeenCalledTimes(1);
  });
});
