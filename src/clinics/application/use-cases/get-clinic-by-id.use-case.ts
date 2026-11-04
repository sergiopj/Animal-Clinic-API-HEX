import { Clinic } from "../../domain/clinic";
import { GetClinicByIdUseCasePort } from "../ports/in/get-clinic-by-id.port";
import { ClinicRepositoryPort } from "../ports/out/clinic-repository.port";

export class GetClinicByIdUseCase implements GetClinicByIdUseCasePort {
  constructor(private readonly clinicRepository: ClinicRepositoryPort) {}

  execute(id: string): Promise<Clinic | null> {
    return this.clinicRepository.findById(id);
  }
}

