import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserRepositoryPort } from "../../../application/ports/out/user-repository.port";

import { UserEntity } from "./user.entity";
import { ClinicMembershipEntity } from "./clinic-membership.entity";
import { ExternalIdentity, UserAccessContext } from "../../../application/access-context";

export class TypeOrmUserRepository implements UserRepositoryPort {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userEntityRepository: Repository<UserEntity>,
        @InjectRepository(ClinicMembershipEntity)
        private readonly clinicMembershipEntityRepository: Repository<ClinicMembershipEntity>
    ) { }

    async findAccessContextByIdentity(identity: ExternalIdentity): Promise<UserAccessContext | null> {

        const userEntity = await this.userEntityRepository.findOne({
            where: {
                issuer: identity.issuer,
                subject: identity.subject,
            },
        });

        if (!userEntity) {
            return null;
        }

        const clinicMemberships = await this.clinicMembershipEntityRepository.find({
            where: { userId: userEntity.id },
        });

        const memberships = clinicMemberships.map((membership) => ({
            userId: membership.userId,
            clinicId: membership.clinicId,
            role: membership.role,
        }));

        return {
            user: {
                id: userEntity.id,
                issuer: userEntity.issuer,
                subject: userEntity.subject,
                platformRole: userEntity.platformRole,
            },
            clinicMemberships: memberships,
        };
    }

}
