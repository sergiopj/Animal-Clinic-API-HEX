import { Pet } from "../../domain/pet";
import { PetRepositoryPort } from "../ports/out/pet-repository.port";
import { UpdatePetUseCasePort } from "../ports/in/update-pet.port";

export class UpdatePetUseCase implements UpdatePetUseCasePort {
    constructor(private readonly petRepository: PetRepositoryPort) { }

    async execute(id: string, pet: Omit<Pet, "id">): Promise<Pet | null> {
        return this.petRepository.update(id, pet);
    }

}
