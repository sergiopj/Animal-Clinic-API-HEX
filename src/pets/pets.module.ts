import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PetEntity } from "./infrastructure/out/persistence/pet.entity";
import { TypeOrmPetRepository } from "./infrastructure/out/persistence/typeorm-pet.repository";
import { PetsController } from "./infrastructure/in/http/pets.controller";
import {
  PetRepositoryPort,
  PET_REPOSITORY,
} from "./application/ports/out/pet-repository.port";
import { CREATE_PET_USE_CASE } from "./application/ports/in/create-pet.port";
import { CreatePetUseCase } from "./application/use-cases/create-pet.use-case";
import { GET_ALL_PETS_USE_CASE } from "./application/ports/in/get-all-pets.port";
import { GetAllPetsUseCase } from "./application/use-cases/get-all-pets.use-case";
import { DELETE_PET_USE_CASE } from "./application/ports/in/delete-pet.port";
import { DeletePetUseCase } from "./application/use-cases/delete-pet.use-case";
import { GetByIdPetUseCase } from "./application/use-cases/get-by-id-pet.use-case";
import { UpdatePetUseCase } from "./application/use-cases/update-pet.use-case";
import { UPDATE_PET_USE_CASE } from "./application/ports/in/update-pet.port";
import { GET_BY_ID_PET_USE_CASE } from "./application/ports/in/get-by-id-pet.port";

@Module({
  imports: [TypeOrmModule.forFeature([PetEntity])],
  providers: [
    {
      provide: PET_REPOSITORY,
      useClass: TypeOrmPetRepository,
    },
    {
      provide: GET_ALL_PETS_USE_CASE,
      useFactory: (repository: PetRepositoryPort) =>
        new GetAllPetsUseCase(repository),
      inject: [PET_REPOSITORY],
    },
    {
      provide: CREATE_PET_USE_CASE,
      useFactory: (repository: PetRepositoryPort) =>
        new CreatePetUseCase(repository),
      inject: [PET_REPOSITORY],
    },
    {
      provide: DELETE_PET_USE_CASE,
      useFactory: (repository: PetRepositoryPort) =>
        new DeletePetUseCase(repository),
      inject: [PET_REPOSITORY],
    },
    {
      provide: GET_BY_ID_PET_USE_CASE,
      useFactory: (repository: PetRepositoryPort) =>
        new GetByIdPetUseCase(repository),
      inject: [PET_REPOSITORY],
    },
    {
      provide: UPDATE_PET_USE_CASE,
      useFactory: (repository: PetRepositoryPort) =>
        new UpdatePetUseCase(repository),
      inject: [PET_REPOSITORY],
    }

  ],
  controllers: [PetsController],
})
export class PetsModule { }
