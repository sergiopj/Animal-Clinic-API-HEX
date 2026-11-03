import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CREATE_CLINIC_USE_CASE } from "./application/ports/in/create-clinic.port";
import {
  ClinicRepositoryPort,
  CLINIC_REPOSITORY,
} from "./application/ports/out/clinic-repository.port";
import { CreateClinicUseCase } from "./application/use-cases/create-clinic.use-case";
import { ClinicsController } from "./infrastructure/in/http/clinics.controller";
import { ClinicEntity } from "./infrastructure/out/persistence/clinic.entity";
import { TypeOrmClinicRepository } from "./infrastructure/out/persistence/typeorm-clinic.repository";

@Module({
  imports: [TypeOrmModule.forFeature([ClinicEntity])],
  providers: [
    {
      provide: CLINIC_REPOSITORY,
      useClass: TypeOrmClinicRepository,
    },
    {
      provide: CREATE_CLINIC_USE_CASE,
      useFactory: (repository: ClinicRepositoryPort) =>
        new CreateClinicUseCase(repository),
      inject: [CLINIC_REPOSITORY],
    },
  ],
  controllers: [ClinicsController],
})
export class ClinicsModule {}
