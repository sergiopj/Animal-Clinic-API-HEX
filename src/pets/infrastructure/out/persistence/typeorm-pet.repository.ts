import { InjectRepository } from "@nestjs/typeorm";
import { PetRepositoryPort } from "../../../application/ports/out/pet-repository.port";
import { PetEntity } from "./pet.entity";
import { Repository } from "typeorm";
import { Pet as DomainPet } from "../../../domain/pet";

export class TypeOrmPetRepository implements PetRepositoryPort {
  constructor(
    @InjectRepository(PetEntity)
    private readonly petEntityRepository: Repository<PetEntity>,
  ) { }

  async findAll(): Promise<DomainPet[]> {
    const entities = await this.petEntityRepository.find();

    return entities.map((entity) => ({
      id: entity.id,
      name: entity.name,
      species: entity.species,
      gender: entity.gender,
      birthdate: entity.birthdate,
    }));
  }

  async create(pet: Omit<DomainPet, "id">): Promise<DomainPet> {
    const entity = this.petEntityRepository.create(pet);
    await this.petEntityRepository.save(entity);
    return this.toDomain(entity);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.petEntityRepository.delete(id);
    return result.affected === 1;
  }

  private toDomain(entity: PetEntity): DomainPet {
    return {
      id: entity.id,
      name: entity.name,
      species: entity.species,
      gender: entity.gender,
      birthdate: entity.birthdate,
    };
  }

}
