import { DeletePetUseCasePort } from "../ports/in/delete-pet.port";
import { PetRepositoryPort } from "../ports/out/pet-repository.port";

export class DeletePetUseCase implements DeletePetUseCasePort {
  constructor(private readonly petRepository: PetRepositoryPort) {}

  execute(id: string, clinicIds?: string[]): Promise<boolean> {
    return this.petRepository.delete(id, clinicIds);
  }
}
