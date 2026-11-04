import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { CurrentUser } from "../../../../auth/decorators/current-user.decorator";
import { AuthenticatedUser } from "../../../../auth/authenticated-user";
import {
  getAuthorizedClinicIds,
  isClinicMember,
  isPlatformAdmin,
} from "../../../../users/application/access-context";
import {
  CREATE_PET_USE_CASE,
  CreatePetUseCasePort,
} from "../../../application/ports/in/create-pet.port";
import {
  DELETE_PET_USE_CASE,
  DeletePetUseCasePort,
} from "../../../application/ports/in/delete-pet.port";
import {
  GET_ALL_PETS_USE_CASE,
  GetAllPetsUseCasePort,
} from "../../../application/ports/in/get-all-pets.port";
import {
  GET_BY_ID_PET_USE_CASE,
  GetByIdPetUseCasePort,
} from "../../../application/ports/in/get-by-id-pet.port";
import {
  UPDATE_PET_USE_CASE,
  UpdatePetUseCasePort,
} from "../../../application/ports/in/update-pet.port";
import { CreatePetRequestDto } from "./dto/create-pet-request.dto";
import { PetResponseDto } from "./dto/pet-response.dto";
import { UpdatePetRequestDto } from "./dto/update-pet-request.dto";

@Controller("pets")
@ApiTags("Pets")
@ApiBearerAuth("bearerAuth")
@ApiUnauthorizedResponse({ description: "Missing or invalid access token" })
@ApiForbiddenResponse({ description: "User lacks permissions for this resource" })
export class PetsController {
  constructor(
    @Inject(GET_ALL_PETS_USE_CASE)
    private readonly getAllPetsUseCase: GetAllPetsUseCasePort,
    @Inject(GET_BY_ID_PET_USE_CASE)
    private readonly getByIdPetUseCase: GetByIdPetUseCasePort,
    @Inject(CREATE_PET_USE_CASE)
    private readonly createPetUseCase: CreatePetUseCasePort,
    @Inject(DELETE_PET_USE_CASE)
    private readonly deletePetUseCase: DeletePetUseCasePort,
    @Inject(UPDATE_PET_USE_CASE)
    private readonly updatePetUseCase: UpdatePetUseCasePort,
  ) {}

  @Get()
  @ApiOperation({
    summary: "List pets authorized for the current user",
    description:
      "Returns pets in clinics where the user has membership, or all pets across clinics for platform admins.",
  })
  @ApiQuery({
    name: "clinicId",
    required: false,
    description: "Filter pets by a specific authorized clinic ID",
  })
  @ApiOkResponse({ type: PetResponseDto, isArray: true })
  async findAll(
    @CurrentUser() user?: AuthenticatedUser,
    @Query("clinicId") requestedClinicId?: string,
  ): Promise<PetResponseDto[]> {
    if (!user?.accessContext) {
      throw new ForbiddenException(
        "User account is not provisioned or lacks permissions",
      );
    }

    if (isPlatformAdmin(user.accessContext)) {
      const clinicScope = requestedClinicId ? [requestedClinicId] : undefined;
      const pets = await this.getAllPetsUseCase.execute(clinicScope);
      return pets.map(PetResponseDto.fromDomain);
    }

    const userClinicIds = getAuthorizedClinicIds(user.accessContext);

    if (requestedClinicId) {
      if (!userClinicIds.includes(requestedClinicId)) {
        throw new ForbiddenException(
          "Not authorized to access pets for the specified clinic",
        );
      }
      const pets = await this.getAllPetsUseCase.execute([requestedClinicId]);
      return pets.map(PetResponseDto.fromDomain);
    }

    if (userClinicIds.length === 0) {
      return [];
    }

    const pets = await this.getAllPetsUseCase.execute(userClinicIds);
    return pets.map(PetResponseDto.fromDomain);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a pet by ID" })
  @ApiOkResponse({ type: PetResponseDto })
  @ApiNotFoundResponse({ description: "Pet not found" })
  async findOne(
    @Param("id", new ParseUUIDPipe()) id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<PetResponseDto> {
    if (!user?.accessContext) {
      throw new ForbiddenException(
        "User account is not provisioned or lacks permissions",
      );
    }

    const clinicScope = isPlatformAdmin(user.accessContext)
      ? undefined
      : getAuthorizedClinicIds(user.accessContext);

    const pet = await this.getByIdPetUseCase.execute(id, clinicScope);

    if (!pet) {
      throw new NotFoundException(`Pet with id ${id} not found`);
    }

    return PetResponseDto.fromDomain(pet);
  }

  @Post()
  @ApiOperation({ summary: "Create a new pet in an authorized clinic" })
  @ApiCreatedResponse({ type: PetResponseDto })
  async create(
    @Body() entity: CreatePetRequestDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<PetResponseDto> {
    if (!user?.accessContext) {
      throw new ForbiddenException(
        "User account is not provisioned or lacks permissions",
      );
    }

    if (
      !isPlatformAdmin(user.accessContext) &&
      !isClinicMember(user.accessContext, entity.clinicId)
    ) {
      throw new ForbiddenException(
        "Not authorized to create pets in this clinic",
      );
    }

    const pet = await this.createPetUseCase.execute(entity);
    return PetResponseDto.fromDomain(pet);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a pet by ID in an authorized clinic" })
  @ApiOkResponse({ type: PetResponseDto })
  @ApiNotFoundResponse({ description: "Pet not found" })
  async update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() entity: UpdatePetRequestDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<PetResponseDto> {
    if (!user?.accessContext) {
      throw new ForbiddenException(
        "User account is not provisioned or lacks permissions",
      );
    }

    if (
      entity.clinicId &&
      !isPlatformAdmin(user.accessContext) &&
      !isClinicMember(user.accessContext, entity.clinicId)
    ) {
      throw new ForbiddenException(
        "Not authorized to move pet to the target clinic",
      );
    }

    const clinicScope = isPlatformAdmin(user.accessContext)
      ? undefined
      : getAuthorizedClinicIds(user.accessContext);

    const updatedPet = await this.updatePetUseCase.execute(
      id,
      entity,
      clinicScope,
    );

    if (!updatedPet) {
      throw new NotFoundException(`Pet with id ${id} not found`);
    }

    return PetResponseDto.fromDomain(updatedPet);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a pet by ID in an authorized clinic" })
  @ApiNoContentResponse({ description: "Pet deleted successfully" })
  @ApiNotFoundResponse({ description: "Pet not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param("id", new ParseUUIDPipe()) id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<void> {
    if (!user?.accessContext) {
      throw new ForbiddenException(
        "User account is not provisioned or lacks permissions",
      );
    }

    const clinicScope = isPlatformAdmin(user.accessContext)
      ? undefined
      : getAuthorizedClinicIds(user.accessContext);

    const deleted = await this.deletePetUseCase.execute(id, clinicScope);

    if (!deleted) {
      throw new NotFoundException(`Pet with id ${id} not found`);
    }
  }
}
