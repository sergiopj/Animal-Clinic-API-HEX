import { Clinic, ClinicStatus } from "../../domain/clinic";
import {
    CreateClinicData,
    CreateClinicUseCasePort,
} from "../ports/in/create-clinic.port";
import { ClinicRepositoryPort } from "../ports/out/clinic-repository.port";

export class CreateClinicUseCase implements CreateClinicUseCasePort {
    constructor(private readonly clinicRepository: ClinicRepositoryPort) { }

    execute(data: CreateClinicData): Promise<Clinic> {
        return this.clinicRepository.create({
            ...data,
            status: ClinicStatus.Active,
        });
    }

}
