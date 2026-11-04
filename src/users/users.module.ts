import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./infrastructure/out/persistence/user.entity";
import { ClinicMembershipEntity } from "./infrastructure/out/persistence/clinic-membership.entity";
import { USER_REPOSITORY, UserRepositoryPort } from "./application/ports/out/user-repository.port";
import { TypeOrmUserRepository } from "./infrastructure/out/persistence/typeorm-user.repository";
import { RESOLVE_USER_ACCESS_CONTEXT_USE_CASE } from "./application/ports/in/resolve-user-access-context.port";
import { ResolveUserAccessContextUseCase } from "./application/use-cases/resolve-user-access-context.use-case";


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
        }

    ],
    controllers: [],
})
export class UsersModule { }
