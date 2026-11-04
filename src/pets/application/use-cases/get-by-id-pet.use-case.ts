import { Pet } from "../../domain/pet";
import { GetByIdPetUseCasePort } from "../ports/in/get-by-id-pet.port";
import { PetRepositoryPort } from "../ports/out/pet-repository.port";

export class GetByIdPetUseCase implements GetByIdPetUseCasePort {
  constructor(private readonly petRepository: PetRepositoryPort) {}

  execute(id: string, clinicIds?: string[]): Promise<Pet | null> {
    return this.petRepository.getById(id, clinicIds);
  }
}
