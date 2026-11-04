import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { ClinicRepositoryPort } from "../../../application/ports/out/clinic-repository.port";
import { Clinic, ClinicStatus } from "../../../domain/clinic";
import { ClinicEntity } from "./clinic.entity";

export class TypeOrmClinicRepository implements ClinicRepositoryPort {
  constructor(
    @InjectRepository(ClinicEntity)
    private readonly clinicEntityRepository: Repository<ClinicEntity>,
  ) {}

  async create(clinic: Omit<Clinic, "id">): Promise<Clinic> {
    const entity = this.clinicEntityRepository.create({
      name: clinic.name,
      status: clinic.status,
      street: clinic.address.street,
      city: clinic.address.city,
      postalCode: clinic.address.postalCode,
      countryCode: clinic.address.countryCode,
      region: clinic.address.region,
      phone: clinic.phone,
      contactEmail: clinic.contactEmail,
    });
    const savedEntity = await this.clinicEntityRepository.save(entity);

    return this.toDomain(savedEntity);
  }

  async findAll(): Promise<Clinic[]> {
    const entities = await this.clinicEntityRepository.find();
    return entities.map((entity) => this.toDomain(entity));
  }

  async findById(id: string): Promise<Clinic | null> {
    const entity = await this.clinicEntityRepository.findOneBy({ id });
    return entity ? this.toDomain(entity) : null;
  }

  async findByIds(ids: string[]): Promise<Clinic[]> {
    if (ids.length === 0) {
      return [];
    }
    const entities = await this.clinicEntityRepository.findBy({ id: In(ids) });
    return entities.map((entity) => this.toDomain(entity));
  }

  async update(
    id: string,
    clinic: Partial<Omit<Clinic, "id">>,
  ): Promise<Clinic | null> {
    const entity = await this.clinicEntityRepository.findOneBy({ id });
    if (!entity) {
      return null;
    }

    if (clinic.name !== undefined) entity.name = clinic.name;
    if (clinic.status !== undefined) entity.status = clinic.status;
    if (clinic.phone !== undefined) entity.phone = clinic.phone;
    if (clinic.contactEmail !== undefined)
      entity.contactEmail = clinic.contactEmail;
    if (clinic.address) {
      if (clinic.address.street !== undefined)
        entity.street = clinic.address.street;
      if (clinic.address.city !== undefined) entity.city = clinic.address.city;
      if (clinic.address.postalCode !== undefined)
        entity.postalCode = clinic.address.postalCode;
      if (clinic.address.countryCode !== undefined)
        entity.countryCode = clinic.address.countryCode;
      if (clinic.address.region !== undefined)
        entity.region = clinic.address.region;
    }

    const savedEntity = await this.clinicEntityRepository.save(entity);
    return this.toDomain(savedEntity);
  }

  async updateStatus(id: string, status: ClinicStatus): Promise<Clinic | null> {
    const entity = await this.clinicEntityRepository.findOneBy({ id });
    if (!entity) {
      return null;
    }
    entity.status = status;
    const savedEntity = await this.clinicEntityRepository.save(entity);
    return this.toDomain(savedEntity);
  }

  private toDomain(entity: ClinicEntity): Clinic {
    return {
      id: entity.id,
      name: entity.name,
      status: entity.status,
      address: {
        street: entity.street,
        city: entity.city,
        postalCode: entity.postalCode,
        countryCode: entity.countryCode,
        region: entity.region,
      },
      phone: entity.phone,
      contactEmail: entity.contactEmail,
    };
  }
}
