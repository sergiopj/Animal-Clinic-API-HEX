import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  ExternalIdentity,
  UserAccessContext,
} from "../../../application/access-context";
import { UserRepositoryPort } from "../../../application/ports/out/user-repository.port";
import {
  ClinicMembership,
  ClinicRole,
} from "../../../domain/clinic-membership";
import { User } from "../../../domain/user";
import { ClinicMembershipEntity } from "./clinic-membership.entity";
import { UserEntity } from "./user.entity";

export class TypeOrmUserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
    @InjectRepository(ClinicMembershipEntity)
    private readonly clinicMembershipEntityRepository: Repository<ClinicMembershipEntity>,
  ) {}

  async findAccessContextByIdentity(
    identity: ExternalIdentity,
  ): Promise<UserAccessContext | null> {
    const userEntity = await this.userEntityRepository.findOne({
      where: {
        issuer: identity.issuer,
        subject: identity.subject,
      },
    });

    if (!userEntity) {
      return null;
    }

    const clinicMemberships =
      await this.clinicMembershipEntityRepository.find({
        where: { userId: userEntity.id },
      });

    return {
      user: this.toDomainUser(userEntity),
      clinicMemberships: clinicMemberships.map((m) =>
        this.toDomainMembership(m),
      ),
    };
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.userEntityRepository.findOneBy({ id });
    return entity ? this.toDomainUser(entity) : null;
  }

  async findByIdentity(identity: ExternalIdentity): Promise<User | null> {
    const entity = await this.userEntityRepository.findOne({
      where: {
        issuer: identity.issuer,
        subject: identity.subject,
      },
    });
    return entity ? this.toDomainUser(entity) : null;
  }

  async createUser(user: Omit<User, "id">): Promise<User> {
    const entity = this.userEntityRepository.create({
      issuer: user.issuer,
      subject: user.subject,
      platformRole: user.platformRole,
    });
    const saved = await this.userEntityRepository.save(entity);
    return this.toDomainUser(saved);
  }

  async findAllUsers(): Promise<User[]> {
    const entities = await this.userEntityRepository.find();
    return entities.map((entity) => this.toDomainUser(entity));
  }

  async findMembership(
    clinicId: string,
    userId: string,
  ): Promise<ClinicMembership | null> {
    const entity = await this.clinicMembershipEntityRepository.findOneBy({
      clinicId,
      userId,
    });
    return entity ? this.toDomainMembership(entity) : null;
  }

  async findMembershipsByClinic(clinicId: string): Promise<ClinicMembership[]> {
    const entities = await this.clinicMembershipEntityRepository.find({
      where: { clinicId },
    });
    return entities.map((entity) => this.toDomainMembership(entity));
  }

  async addMembership(membership: ClinicMembership): Promise<ClinicMembership> {
    const entity = this.clinicMembershipEntityRepository.create({
      userId: membership.userId,
      clinicId: membership.clinicId,
      role: membership.role,
    });
    const saved = await this.clinicMembershipEntityRepository.save(entity);
    return this.toDomainMembership(saved);
  }

  async updateMembershipRole(
    clinicId: string,
    userId: string,
    role: ClinicRole,
  ): Promise<ClinicMembership | null> {
    const entity = await this.clinicMembershipEntityRepository.findOneBy({
      clinicId,
      userId,
    });
    if (!entity) {
      return null;
    }
    entity.role = role;
    const saved = await this.clinicMembershipEntityRepository.save(entity);
    return this.toDomainMembership(saved);
  }

  async removeMembership(clinicId: string, userId: string): Promise<boolean> {
    const result = await this.clinicMembershipEntityRepository.delete({
      clinicId,
      userId,
    });
    return (result.affected ?? 0) > 0;
  }

  private toDomainUser(entity: UserEntity): User {
    return {
      id: entity.id,
      issuer: entity.issuer,
      subject: entity.subject,
      platformRole: entity.platformRole,
    };
  }

  private toDomainMembership(
    entity: ClinicMembershipEntity,
  ): ClinicMembership {
    return {
      userId: entity.userId,
      clinicId: entity.clinicId,
      role: entity.role,
    };
  }
}
