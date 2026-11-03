import { describe, expect, it, jest } from "@jest/globals";
import { ClinicRepositoryPort } from "../../../../src/clinics/application/ports/out/clinic-repository.port";
import { CreateClinicUseCase } from "../../../../src/clinics/application/use-cases/create-clinic.use-case";
import { Clinic, ClinicStatus } from "../../../../src/clinics/domain/clinic";
import { ClinicCountryCode } from "../../../../src/clinics/domain/clinic-address";

describe("CreateClinicUseCase", () => {
  it("creates an active clinic using the repository", async () => {
    const input = {
      name: "Barruelos Clinic Center",
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
    const createdClinic: Clinic = {
      id: "clinic-id",
      ...input,
      status: ClinicStatus.Active,
    };
    const clinicRepository: ClinicRepositoryPort = {
      create: jest.fn<(clinic: Omit<Clinic, "id">) => Promise<Clinic>>()
        .mockResolvedValue(createdClinic),
    };
    const useCase = new CreateClinicUseCase(clinicRepository);

    const result = await useCase.execute(input);

    expect(result).toEqual(createdClinic);
    expect(clinicRepository.create).toHaveBeenCalledWith({
      ...input,
      status: ClinicStatus.Active,
    });
  });
});
