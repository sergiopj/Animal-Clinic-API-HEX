import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, NotFoundException, Param, ParseUUIDPipe, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  GetAllPetsUseCasePort,
  GET_ALL_PETS_USE_CASE,
} from "../../../application/ports/in/get-all-pets.port";
import { PetResponseDto } from "./dto/pet-response.dto";
import { CREATE_PET_USE_CASE, CreatePetUseCasePort } from "../../../application/ports/in/create-pet.port";
import { CreatePetRequestDto } from "./dto/create-pet-request.dto";
import { DELETE_PET_USE_CASE, DeletePetUseCasePort } from "../../../application/ports/in/delete-pet.port";

@Controller("pets")
@ApiTags("Pets")
export class PetsController {
  constructor(
    @Inject(GET_ALL_PETS_USE_CASE)
    private readonly getAllPetsUseCase: GetAllPetsUseCasePort,
    @Inject(CREATE_PET_USE_CASE)
    private readonly createPetUseCase: CreatePetUseCasePort,
    @Inject(DELETE_PET_USE_CASE)
    private readonly deletePetUseCase: DeletePetUseCasePort
  ) { }

  @Get()
  @ApiOperation({ summary: "List all pets" })
  @ApiOkResponse({ type: PetResponseDto, isArray: true })
  async findAll(): Promise<PetResponseDto[]> {
    const pets = await this.getAllPetsUseCase.execute();

    return pets.map(PetResponseDto.fromDomain);
  }

  @Post()
  @ApiOperation({ summary: "Create a new pet" })
  @ApiCreatedResponse({ type: PetResponseDto })
  async create(@Body() entity: CreatePetRequestDto): Promise<PetResponseDto> {
    const pet = await this.createPetUseCase.execute(entity);
    return PetResponseDto.fromDomain(pet);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a pet by ID" })
  @ApiOkResponse({ description: "Pet deleted successfully" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param("id", new ParseUUIDPipe()) id: string): Promise<void> {
    const deleted = await this.deletePetUseCase.execute(id);

    if (!deleted) {
      throw new NotFoundException(`Pet with id ${id} not found`);
    }
  }
}
