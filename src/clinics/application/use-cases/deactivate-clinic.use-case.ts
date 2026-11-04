import { Clinic, ClinicStatus } from "../../domain/clinic";
import { DeactivateClinicUseCasePort } from "../ports/in/deactivate-clinic.port";
import { ClinicRepositoryPort } from "../ports/out/clinic-repository.port";

export class DeactivateClinicUseCase implements DeactivateClinicUseCasePort {
  constructor(private readonly clinicRepository: ClinicRepositoryPort) {}

  execute(id: string): Promise<Clinic | null> {
    return this.clinicRepository.updateStatus(id, ClinicStatus.Inactive);
  }
}

