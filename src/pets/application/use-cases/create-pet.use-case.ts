import { Pet } from "../../domain/pet";
import { PetRepositoryPort } from "../ports/out/pet-repository.port";
import { CreatePetUseCasePort } from "../ports/in/create-pet.port";

export class CreatePetUseCase implements CreatePetUseCasePort {
    constructor(private readonly petRepository: PetRepositoryPort) { }

    execute(pet: Omit<Pet, "id">): Promise<Pet> {
        return this.petRepository.create(pet);
    }

}
