import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ClinicRepositoryPort } from "../../../application/ports/out/clinic-repository.port";
import { Clinic } from "../../../domain/clinic";
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
