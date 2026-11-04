import { describe, expect, it, jest } from "@jest/globals";
import { ClinicRepositoryPort } from "../../../../src/clinics/application/ports/out/clinic-repository.port";
import { DeactivateClinicUseCase } from "../../../../src/clinics/application/use-cases/deactivate-clinic.use-case";
import { GetAllClinicsUseCase } from "../../../../src/clinics/application/use-cases/get-all-clinics.use-case";
import { GetClinicByIdUseCase } from "../../../../src/clinics/application/use-cases/get-clinic-by-id.use-case";
import { UpdateClinicUseCase } from "../../../../src/clinics/application/use-cases/update-clinic.use-case";
import { Clinic, ClinicStatus } from "../../../../src/clinics/domain/clinic";
import { ClinicCountryCode } from "../../../../src/clinics/domain/clinic-address";

describe("Clinic Use Cases", () => {
  const sampleClinic: Clinic = {
    id: "clinic-1",
    name: "Barruelos Clinic Center",
    status: ClinicStatus.Active,
    address: {
      street: "Paseo Rogativas, 123",
      city: "Sevilla",
      postalCode: "41001",
      countryCode: ClinicCountryCode.Spain,
      region: "Andalucia",
    },
    phone: "+34600123456",
    contactEmail: "contact@clinic.example",
  };

  const mockRepo = {
    create: jest.fn<any>(),
    findAll: jest.fn<any>(),
    findById: jest.fn<any>(),
    findByIds: jest.fn<any>(),
    update: jest.fn<any>(),
    updateStatus: jest.fn<any>(),
  } as unknown as ClinicRepositoryPort;

  describe("GetAllClinicsUseCase", () => {
    const useCase = new GetAllClinicsUseCase(mockRepo);

    it("returns all clinics when no IDs specified", async () => {
      (mockRepo.findAll as jest.Mock<any>).mockResolvedValue([sampleClinic]);
      const result = await useCase.execute();
      expect(result).toEqual([sampleClinic]);
      expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
    });

    it("filters by IDs when IDs are provided", async () => {
      (mockRepo.findByIds as jest.Mock<any>).mockResolvedValue([
        sampleClinic,
      ]);
      const result = await useCase.execute(["clinic-1"]);
      expect(result).toEqual([sampleClinic]);
      expect(mockRepo.findByIds).toHaveBeenCalledWith(["clinic-1"]);
    });
  });

  describe("GetClinicByIdUseCase", () => {
    const useCase = new GetClinicByIdUseCase(mockRepo);

    it("returns clinic by ID", async () => {
      (mockRepo.findById as jest.Mock<any>).mockResolvedValue(sampleClinic);
      const result = await useCase.execute("clinic-1");
      expect(result).toEqual(sampleClinic);
      expect(mockRepo.findById).toHaveBeenCalledWith("clinic-1");
    });

    it("returns null when clinic not found", async () => {
      (mockRepo.findById as jest.Mock<any>).mockResolvedValue(null);
      const result = await useCase.execute("non-existent");
      expect(result).toBeNull();
    });
  });

  describe("UpdateClinicUseCase", () => {
    const useCase = new UpdateClinicUseCase(mockRepo);

    it("updates clinic fields", async () => {
      const updatedClinic = { ...sampleClinic, name: "New Name" };
      (mockRepo.update as jest.Mock<any>).mockResolvedValue(updatedClinic);

      const result = await useCase.execute("clinic-1", { name: "New Name" });
      expect(result).toEqual(updatedClinic);
      expect(mockRepo.update).toHaveBeenCalledWith("clinic-1", {
        name: "New Name",
      });
    });
  });

  describe("DeactivateClinicUseCase", () => {
    const useCase = new DeactivateClinicUseCase(mockRepo);

    it("sets clinic status to Inactive", async () => {
      const inactiveClinic = {
        ...sampleClinic,
        status: ClinicStatus.Inactive,
      };
      (mockRepo.updateStatus as jest.Mock<any>).mockResolvedValue(
        inactiveClinic,
      );

      const result = await useCase.execute("clinic-1");
      expect(result).toEqual(inactiveClinic);
      expect(mockRepo.updateStatus).toHaveBeenCalledWith(
        "clinic-1",
        ClinicStatus.Inactive,
      );
    });
  });
});
