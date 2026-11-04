import { Clinic } from "../../domain/clinic";
import { GetAllClinicsUseCasePort } from "../ports/in/get-all-clinics.port";
import { ClinicRepositoryPort } from "../ports/out/clinic-repository.port";

export class GetAllClinicsUseCase implements GetAllClinicsUseCasePort {
  constructor(private readonly clinicRepository: ClinicRepositoryPort) {}

  execute(ids?: string[]): Promise<Clinic[]> {
    if (ids) {
      return this.clinicRepository.findByIds(ids);
    }
    return this.clinicRepository.findAll();
  }
}

