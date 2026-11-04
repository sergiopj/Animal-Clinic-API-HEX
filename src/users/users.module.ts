import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ASSIGN_CLINIC_MEMBERSHIP_USE_CASE } from "./application/ports/in/assign-clinic-membership.port";
import { LIST_CLINIC_MEMBERSHIPS_USE_CASE } from "./application/ports/in/list-clinic-memberships.port";
import { LIST_USERS_USE_CASE } from "./application/ports/in/list-users.port";
import { RESOLVE_USER_ACCESS_CONTEXT_USE_CASE } from "./application/ports/in/resolve-user-access-context.port";
import { REVOKE_CLINIC_MEMBERSHIP_USE_CASE } from "./application/ports/in/revoke-clinic-membership.port";
import { UPDATE_CLINIC_MEMBERSHIP_ROLE_USE_CASE } from "./application/ports/in/update-clinic-membership-role.port";
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from "./application/ports/out/user-repository.port";
import { AssignClinicMembershipUseCase } from "./application/use-cases/assign-clinic-membership.use-case";
import { ListClinicMembershipsUseCase } from "./application/use-cases/list-clinic-memberships.use-case";
import { ListUsersUseCase } from "./application/use-cases/list-users.use-case";
import { ResolveUserAccessContextUseCase } from "./application/use-cases/resolve-user-access-context.use-case";
import { RevokeClinicMembershipUseCase } from "./application/use-cases/revoke-clinic-membership.use-case";
import { UpdateClinicMembershipRoleUseCase } from "./application/use-cases/update-clinic-membership-role.use-case";
import { ClinicMembershipsController } from "./infrastructure/in/http/clinic-memberships.controller";
import { UsersController } from "./infrastructure/in/http/users.controller";
import { ClinicMembershipEntity } from "./infrastructure/out/persistence/clinic-membership.entity";
import { TypeOrmUserRepository } from "./infrastructure/out/persistence/typeorm-user.repository";
import { UserEntity } from "./infrastructure/out/persistence/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, ClinicMembershipEntity])],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: RESOLVE_USER_ACCESS_CONTEXT_USE_CASE,
      useFactory: (repository: UserRepositoryPort) =>
        new ResolveUserAccessContextUseCase(repository),
      inject: [USER_REPOSITORY],
    },
    {
      provide: ASSIGN_CLINIC_MEMBERSHIP_USE_CASE,
      useFactory: (repository: UserRepositoryPort) =>
        new AssignClinicMembershipUseCase(repository),
      inject: [USER_REPOSITORY],
    },
    {
      provide: UPDATE_CLINIC_MEMBERSHIP_ROLE_USE_CASE,
      useFactory: (repository: UserRepositoryPort) =>
        new UpdateClinicMembershipRoleUseCase(repository),
      inject: [USER_REPOSITORY],
    },
    {
      provide: REVOKE_CLINIC_MEMBERSHIP_USE_CASE,
      useFactory: (repository: UserRepositoryPort) =>
        new RevokeClinicMembershipUseCase(repository),
      inject: [USER_REPOSITORY],
    },
    {
      provide: LIST_CLINIC_MEMBERSHIPS_USE_CASE,
      useFactory: (repository: UserRepositoryPort) =>
        new ListClinicMembershipsUseCase(repository),
      inject: [USER_REPOSITORY],
    },
    {
      provide: LIST_USERS_USE_CASE,
      useFactory: (repository: UserRepositoryPort) =>
        new ListUsersUseCase(repository),
      inject: [USER_REPOSITORY],
    },
  ],
  controllers: [ClinicMembershipsController, UsersController],
  exports: [RESOLVE_USER_ACCESS_CONTEXT_USE_CASE, USER_REPOSITORY],
})
export class UsersModule {}
