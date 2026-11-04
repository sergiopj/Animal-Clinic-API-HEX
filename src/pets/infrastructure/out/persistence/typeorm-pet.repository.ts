import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { PetRepositoryPort } from "../../../application/ports/out/pet-repository.port";
import { Pet as DomainPet } from "../../../domain/pet";
import { PetEntity } from "./pet.entity";

export class TypeOrmPetRepository implements PetRepositoryPort {
  constructor(
    @InjectRepository(PetEntity)
    private readonly petEntityRepository: Repository<PetEntity>,
  ) {}

  async findAll(clinicIds?: string[]): Promise<DomainPet[]> {
    if (clinicIds !== undefined && clinicIds.length === 0) {
      return [];
    }

    const where = clinicIds ? { clinicId: In(clinicIds) } : {};
    const entities = await this.petEntityRepository.find({ where });

    return entities.map((entity) => this.toDomain(entity));
  }

  async getById(id: string, clinicIds?: string[]): Promise<DomainPet | null> {
    if (clinicIds !== undefined && clinicIds.length === 0) {
      return null;
    }

    const where = clinicIds ? { id, clinicId: In(clinicIds) } : { id };
    const entity = await this.petEntityRepository.findOne({ where });
    return entity ? this.toDomain(entity) : null;
  }

  async create(pet: Omit<DomainPet, "id">): Promise<DomainPet> {
    const entity = this.petEntityRepository.create({
      name: pet.name,
      species: pet.species,
      gender: pet.gender,
      birthdate: pet.birthdate,
      clinicId: pet.clinicId,
    });
    const savedEntity = await this.petEntityRepository.save(entity);
    return this.toDomain(savedEntity);
  }

  async update(
    id: string,
    pet: Partial<Omit<DomainPet, "id">>,
    clinicIds?: string[],
  ): Promise<DomainPet | null> {
    if (clinicIds !== undefined && clinicIds.length === 0) {
      return null;
    }

    const where = clinicIds ? { id, clinicId: In(clinicIds) } : { id };
    const entity = await this.petEntityRepository.findOne({ where });
    if (!entity) {
      return null;
    }

    Object.assign(entity, pet);
    const savedEntity = await this.petEntityRepository.save(entity);
    return this.toDomain(savedEntity);
  }

  async delete(id: string, clinicIds?: string[]): Promise<boolean> {
    if (clinicIds !== undefined && clinicIds.length === 0) {
      return false;
    }

    const where = clinicIds ? { id, clinicId: In(clinicIds) } : { id };
    const entity = await this.petEntityRepository.findOne({ where });
    if (!entity) {
      return false;
    }

    const result = await this.petEntityRepository.delete(entity.id);
    return result.affected === 1;
  }

  private toDomain(entity: PetEntity): DomainPet {
    return {
      id: entity.id,
      name: entity.name,
      species: entity.species,
      gender: entity.gender,
      birthdate: entity.birthdate,
      clinicId: entity.clinicId,
    };
  }
}
