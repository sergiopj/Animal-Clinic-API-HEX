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
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { CurrentUser } from "../../../../auth/decorators/current-user.decorator";
import { AuthenticatedUser } from "../../../../auth/authenticated-user";
import {
  getAuthorizedClinicIds,
  isPlatformAdmin,
} from "../../../../users/application/access-context";
import {
  CREATE_CLINIC_USE_CASE,
  CreateClinicUseCasePort,
} from "../../../application/ports/in/create-clinic.port";
import {
  DEACTIVATE_CLINIC_USE_CASE,
  DeactivateClinicUseCasePort,
} from "../../../application/ports/in/deactivate-clinic.port";
import {
  GET_ALL_CLINICS_USE_CASE,
  GetAllClinicsUseCasePort,
} from "../../../application/ports/in/get-all-clinics.port";
import {
  GET_CLINIC_BY_ID_USE_CASE,
  GetClinicByIdUseCasePort,
} from "../../../application/ports/in/get-clinic-by-id.port";
import {
  UPDATE_CLINIC_USE_CASE,
  UpdateClinicUseCasePort,
} from "../../../application/ports/in/update-clinic.port";
import { ClinicResponseDto } from "./dto/clinic-response.dto";
import { CreateClinicRequestDto } from "./dto/create-clinic-request.dto";
import { UpdateClinicRequestDto } from "./dto/update-clinic-request.dto";

@Controller("clinics")
@ApiTags("Clinics")
@ApiBearerAuth("bearerAuth")
@ApiUnauthorizedResponse({ description: "Missing or invalid access token" })
@ApiForbiddenResponse({
  description: "User lacks permissions for this clinic operation",
})
export class ClinicsController {
  constructor(
    @Inject(CREATE_CLINIC_USE_CASE)
    private readonly createClinicUseCase: CreateClinicUseCasePort,
    @Inject(GET_ALL_CLINICS_USE_CASE)
    private readonly getAllClinicsUseCase: GetAllClinicsUseCasePort,
    @Inject(GET_CLINIC_BY_ID_USE_CASE)
    private readonly getClinicByIdUseCase: GetClinicByIdUseCasePort,
    @Inject(UPDATE_CLINIC_USE_CASE)
    private readonly updateClinicUseCase: UpdateClinicUseCasePort,
    @Inject(DEACTIVATE_CLINIC_USE_CASE)
    private readonly deactivateClinicUseCase: DeactivateClinicUseCasePort,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a clinic (Platform admin only)" })
  @ApiCreatedResponse({ type: ClinicResponseDto })
  async create(
    @Body() request: CreateClinicRequestDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ClinicResponseDto> {
    if (!user?.accessContext || !isPlatformAdmin(user.accessContext)) {
      throw new ForbiddenException(
        "Only platform administrators can create clinics",
      );
    }

    const clinic = await this.createClinicUseCase.execute(request);
    return ClinicResponseDto.fromDomain(clinic);
  }

  @Get()
  @ApiOperation({
    summary: "List clinics authorized for the current user",
    description:
      "Platform admins receive all clinics; clinic staff receive clinics they belong to.",
  })
  @ApiOkResponse({ type: ClinicResponseDto, isArray: true })
  async findAll(
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ClinicResponseDto[]> {
    if (!user?.accessContext) {
      throw new ForbiddenException(
        "User account is not provisioned or lacks permissions",
      );
    }

    if (isPlatformAdmin(user.accessContext)) {
      const clinics = await this.getAllClinicsUseCase.execute();
      return clinics.map(ClinicResponseDto.fromDomain);
    }

    const authorizedClinicIds = getAuthorizedClinicIds(user.accessContext);
    if (authorizedClinicIds.length === 0) {
      return [];
    }

    const clinics = await this.getAllClinicsUseCase.execute(
      authorizedClinicIds,
    );
    return clinics.map(ClinicResponseDto.fromDomain);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a clinic by ID" })
  @ApiOkResponse({ type: ClinicResponseDto })
  @ApiNotFoundResponse({ description: "Clinic not found" })
  async findOne(
    @Param("id", new ParseUUIDPipe()) id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ClinicResponseDto> {
    if (!user?.accessContext) {
      throw new ForbiddenException(
        "User account is not provisioned or lacks permissions",
      );
    }

    if (!isPlatformAdmin(user.accessContext)) {
      const authorizedClinicIds = getAuthorizedClinicIds(user.accessContext);
      if (!authorizedClinicIds.includes(id)) {
        throw new NotFoundException(`Clinic with id ${id} not found`);
      }
    }

    const clinic = await this.getClinicByIdUseCase.execute(id);
    if (!clinic) {
      throw new NotFoundException(`Clinic with id ${id} not found`);
    }

    return ClinicResponseDto.fromDomain(clinic);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a clinic (Platform admin only)" })
  @ApiOkResponse({ type: ClinicResponseDto })
  @ApiNotFoundResponse({ description: "Clinic not found" })
  async update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() request: UpdateClinicRequestDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ClinicResponseDto> {
    if (!user?.accessContext || !isPlatformAdmin(user.accessContext)) {
      throw new ForbiddenException(
        "Only platform administrators can manage clinics",
      );
    }

    const updated = await this.updateClinicUseCase.execute(id, request);
    if (!updated) {
      throw new NotFoundException(`Clinic with id ${id} not found`);
    }

    return ClinicResponseDto.fromDomain(updated);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Deactivate a clinic (Platform admin only)" })
  @ApiNoContentResponse({ description: "Clinic deactivated successfully" })
  @ApiNotFoundResponse({ description: "Clinic not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param("id", new ParseUUIDPipe()) id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<void> {
    if (!user?.accessContext || !isPlatformAdmin(user.accessContext)) {
      throw new ForbiddenException(
        "Only platform administrators can manage clinics",
      );
    }

    const deactivated = await this.deactivateClinicUseCase.execute(id);
    if (!deactivated) {
      throw new NotFoundException(`Clinic with id ${id} not found`);
    }
  }
}
