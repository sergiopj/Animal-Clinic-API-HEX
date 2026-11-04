import { describe, expect, it, jest } from "@jest/globals";
import { PetRepositoryPort } from "../../../../src/pets/application/ports/out/pet-repository.port";
import { DeletePetUseCase } from "../../../../src/pets/application/use-cases/delete-pet.use-case";
import { GetAllPetsUseCase } from "../../../../src/pets/application/use-cases/get-all-pets.use-case";
import { GetByIdPetUseCase } from "../../../../src/pets/application/use-cases/get-by-id-pet.use-case";
import { UpdatePetUseCase } from "../../../../src/pets/application/use-cases/update-pet.use-case";
import { Gender, Pet, Species } from "../../../../src/pets/domain/pet";

describe("Pets Multi-Clinic Isolation Use Cases", () => {
  const samplePet: Pet = {
    id: "pet-1",
    name: "Luna",
    species: Species.Dog,
    gender: Gender.Female,
    birthdate: "2020-03-15",
    clinicId: "clinic-A",
  };

  const mockRepo = {
    create: jest.fn<any>(),
    findAll: jest.fn<any>(),
    getById: jest.fn<any>(),
    update: jest.fn<any>(),
    delete: jest.fn<any>(),
  } as unknown as PetRepositoryPort;

  it("GetAllPetsUseCase passes clinic filter to repository", async () => {
    (mockRepo.findAll as jest.Mock<any>).mockResolvedValue([samplePet]);
    const useCase = new GetAllPetsUseCase(mockRepo);

    const result = await useCase.execute(["clinic-A"]);
    expect(result).toEqual([samplePet]);
    expect(mockRepo.findAll).toHaveBeenCalledWith(["clinic-A"]);
  });

  it("GetByIdPetUseCase scopes query to authorized clinics", async () => {
    (mockRepo.getById as jest.Mock<any>).mockResolvedValue(samplePet);
    const useCase = new GetByIdPetUseCase(mockRepo);

    const result = await useCase.execute("pet-1", ["clinic-A"]);
    expect(result).toEqual(samplePet);
    expect(mockRepo.getById).toHaveBeenCalledWith("pet-1", ["clinic-A"]);
  });

  it("GetByIdPetUseCase returns null when pet is in an unauthorized clinic", async () => {
    (mockRepo.getById as jest.Mock<any>).mockResolvedValue(null);
    const useCase = new GetByIdPetUseCase(mockRepo);

    const result = await useCase.execute("pet-1", ["clinic-B"]);
    expect(result).toBeNull();
  });

  it("UpdatePetUseCase scopes update to authorized clinics", async () => {
    const updated = { ...samplePet, name: "Luna Updated" };
    (mockRepo.update as jest.Mock<any>).mockResolvedValue(updated);
    const useCase = new UpdatePetUseCase(mockRepo);

    const result = await useCase.execute(
      "pet-1",
      { name: "Luna Updated" },
      ["clinic-A"],
    );
    expect(result).toEqual(updated);
    expect(mockRepo.update).toHaveBeenCalledWith(
      "pet-1",
      { name: "Luna Updated" },
      ["clinic-A"],
    );
  });

  it("DeletePetUseCase scopes deletion to authorized clinics", async () => {
    (mockRepo.delete as jest.Mock<any>).mockResolvedValue(true);
    const useCase = new DeletePetUseCase(mockRepo);

    const result = await useCase.execute("pet-1", ["clinic-A"]);
    expect(result).toBe(true);
    expect(mockRepo.delete).toHaveBeenCalledWith("pet-1", ["clinic-A"]);
  });
});
