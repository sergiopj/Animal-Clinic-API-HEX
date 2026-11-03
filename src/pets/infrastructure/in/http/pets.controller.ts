import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, NotFoundException, Param, ParseUUIDPipe, Post, Put } from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import {
  GetAllPetsUseCasePort,
  GET_ALL_PETS_USE_CASE,
} from "../../../application/ports/in/get-all-pets.port";
import { PetResponseDto } from "./dto/pet-response.dto";
import { CREATE_PET_USE_CASE, CreatePetUseCasePort } from "../../../application/ports/in/create-pet.port";
import { CreatePetRequestDto } from "./dto/create-pet-request.dto";
import { DELETE_PET_USE_CASE, DeletePetUseCasePort } from "../../../application/ports/in/delete-pet.port";
import { UPDATE_PET_USE_CASE, UpdatePetUseCasePort } from "../../../application/ports/in/update-pet.port";
import { UpdatePetRequestDto } from "./dto/update-pet-request.dto";
import { GET_BY_ID_PET_USE_CASE, GetByIdPetUseCasePort } from "../../../application/ports/in/get-by-id-pet.port";

@Controller("pets")
@ApiTags("Pets")
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
    private readonly updatePetUseCase: UpdatePetUseCasePort
  ) { }

  @Get()
  @ApiOperation({ summary: "List all pets" })
  @ApiOkResponse({ type: PetResponseDto, isArray: true })
  async findAll(): Promise<PetResponseDto[]> {
    const pets = await this.getAllPetsUseCase.execute();

    return pets.map(PetResponseDto.fromDomain);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a pet by ID" })
  @ApiOkResponse({ type: PetResponseDto })
  async findOne(@Param("id", new ParseUUIDPipe()) id: string): Promise<PetResponseDto> {
    const pet = await this.getByIdPetUseCase.execute(id);

    if (!pet) {
      throw new NotFoundException(`Pet with id ${id} not found`);
    }

    return PetResponseDto.fromDomain(pet);
  }

  @Post()
  @ApiOperation({ summary: "Create a new pet" })
  @ApiCreatedResponse({ type: PetResponseDto })
  async create(@Body() entity: CreatePetRequestDto): Promise<PetResponseDto> {
    const pet = await this.createPetUseCase.execute(entity);
    return PetResponseDto.fromDomain(pet);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a pet by ID" })
  @ApiOkResponse({ type: PetResponseDto })
  async update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() entity: UpdatePetRequestDto
  ): Promise<PetResponseDto> {
    const updatedPet = await this.updatePetUseCase.execute(id, entity);

    if (!updatedPet) {
      throw new NotFoundException(`Pet with id ${id} not found`);
    }

    return PetResponseDto.fromDomain(updatedPet);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a pet by ID" })
  @ApiNoContentResponse({ description: "Pet deleted successfully" })
  @ApiNotFoundResponse({ description: "Pet not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param("id", new ParseUUIDPipe()) id: string): Promise<void> {
    const deleted = await this.deletePetUseCase.execute(id);

    if (!deleted) {
      throw new NotFoundException(`Pet with id ${id} not found`);
    }
  }
}
