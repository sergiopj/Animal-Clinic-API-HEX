import { Clinic } from "../../domain/clinic";
import { UpdateClinicUseCasePort } from "../ports/in/update-clinic.port";
import { ClinicRepositoryPort } from "../ports/out/clinic-repository.port";

export class UpdateClinicUseCase implements UpdateClinicUseCasePort {
  constructor(private readonly clinicRepository: ClinicRepositoryPort) {}

  execute(
    id: string,
    data: Partial<Omit<Clinic, "id">>,
  ): Promise<Clinic | null> {
    return this.clinicRepository.update(id, data);
  }
}

