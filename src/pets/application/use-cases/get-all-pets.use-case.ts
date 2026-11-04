import { Pet } from "../../domain/pet";
import { GetAllPetsUseCasePort } from "../ports/in/get-all-pets.port";
import { PetRepositoryPort } from "../ports/out/pet-repository.port";

export class GetAllPetsUseCase implements GetAllPetsUseCasePort {
  constructor(private readonly petRepository: PetRepositoryPort) {}

  execute(clinicIds?: string[]): Promise<Pet[]> {
    return this.petRepository.findAll(clinicIds);
  }
}
