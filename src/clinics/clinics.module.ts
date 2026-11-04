import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CREATE_CLINIC_USE_CASE } from "./application/ports/in/create-clinic.port";
import { DEACTIVATE_CLINIC_USE_CASE } from "./application/ports/in/deactivate-clinic.port";
import { GET_ALL_CLINICS_USE_CASE } from "./application/ports/in/get-all-clinics.port";
import { GET_CLINIC_BY_ID_USE_CASE } from "./application/ports/in/get-clinic-by-id.port";
import { UPDATE_CLINIC_USE_CASE } from "./application/ports/in/update-clinic.port";
import {
  ClinicRepositoryPort,
  CLINIC_REPOSITORY,
} from "./application/ports/out/clinic-repository.port";
import { CreateClinicUseCase } from "./application/use-cases/create-clinic.use-case";
import { DeactivateClinicUseCase } from "./application/use-cases/deactivate-clinic.use-case";
import { GetAllClinicsUseCase } from "./application/use-cases/get-all-clinics.use-case";
import { GetClinicByIdUseCase } from "./application/use-cases/get-clinic-by-id.use-case";
import { UpdateClinicUseCase } from "./application/use-cases/update-clinic.use-case";
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
    {
      provide: GET_ALL_CLINICS_USE_CASE,
      useFactory: (repository: ClinicRepositoryPort) =>
        new GetAllClinicsUseCase(repository),
      inject: [CLINIC_REPOSITORY],
    },
    {
      provide: GET_CLINIC_BY_ID_USE_CASE,
      useFactory: (repository: ClinicRepositoryPort) =>
        new GetClinicByIdUseCase(repository),
      inject: [CLINIC_REPOSITORY],
    },
    {
      provide: UPDATE_CLINIC_USE_CASE,
      useFactory: (repository: ClinicRepositoryPort) =>
        new UpdateClinicUseCase(repository),
      inject: [CLINIC_REPOSITORY],
    },
    {
      provide: DEACTIVATE_CLINIC_USE_CASE,
      useFactory: (repository: ClinicRepositoryPort) =>
        new DeactivateClinicUseCase(repository),
      inject: [CLINIC_REPOSITORY],
    },
  ],
  controllers: [ClinicsController],
  exports: [CLINIC_REPOSITORY],
})
export class ClinicsModule {}
