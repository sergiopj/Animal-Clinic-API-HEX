import { Body, Controller, Inject, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  CREATE_CLINIC_USE_CASE,
  CreateClinicUseCasePort,
} from "../../../application/ports/in/create-clinic.port";
import { ClinicResponseDto } from "./dto/clinic-response.dto";
import { CreateClinicRequestDto } from "./dto/create-clinic-request.dto";

@Controller("clinics")
@ApiTags("Clinics")
export class ClinicsController {
  constructor(
    @Inject(CREATE_CLINIC_USE_CASE)
    private readonly createClinicUseCase: CreateClinicUseCasePort,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a clinic" })
  @ApiCreatedResponse({ type: ClinicResponseDto })
  async create(
    @Body() request: CreateClinicRequestDto,
  ): Promise<ClinicResponseDto> {
    const clinic = await this.createClinicUseCase.execute(request);
    return ClinicResponseDto.fromDomain(clinic);
  }
}
