import {
  BadRequestException,
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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { AuthenticatedUser } from "../../../../auth/authenticated-user";
import { CurrentUser } from "../../../../auth/decorators/current-user.decorator";
import {
  isClinicAdmin,
  isPlatformAdmin,
} from "../../../application/access-context";
import {
  ASSIGN_CLINIC_MEMBERSHIP_USE_CASE,
  AssignClinicMembershipPort,
} from "../../../application/ports/in/assign-clinic-membership.port";
import {
  LIST_CLINIC_MEMBERSHIPS_USE_CASE,
  ListClinicMembershipsPort,
} from "../../../application/ports/in/list-clinic-memberships.port";
import {
  REVOKE_CLINIC_MEMBERSHIP_USE_CASE,
  RevokeClinicMembershipPort,
} from "../../../application/ports/in/revoke-clinic-membership.port";
import {
  UPDATE_CLINIC_MEMBERSHIP_ROLE_USE_CASE,
  UpdateClinicMembershipRolePort,
} from "../../../application/ports/in/update-clinic-membership-role.port";
import { AssignClinicMembershipRequestDto } from "./dto/assign-clinic-membership-request.dto";
import { ClinicMembershipResponseDto } from "./dto/clinic-membership-response.dto";
import { UpdateClinicMembershipRequestDto } from "./dto/update-clinic-membership-request.dto";

@Controller("clinics/:clinicId/memberships")
@ApiTags("Clinic Memberships")
@ApiBearerAuth("bearerAuth")
@ApiUnauthorizedResponse({ description: "Missing or invalid access token" })
@ApiForbiddenResponse({
  description:
    "User lacks permission to manage memberships for this clinic (requires clinic_admin of this clinic or platform_admin)",
})
export class ClinicMembershipsController {
  constructor(
    @Inject(LIST_CLINIC_MEMBERSHIPS_USE_CASE)
    private readonly listClinicMembershipsUseCase: ListClinicMembershipsPort,
    @Inject(ASSIGN_CLINIC_MEMBERSHIP_USE_CASE)
    private readonly assignClinicMembershipUseCase: AssignClinicMembershipPort,
    @Inject(UPDATE_CLINIC_MEMBERSHIP_ROLE_USE_CASE)
    private readonly updateClinicMembershipRoleUseCase: UpdateClinicMembershipRolePort,
    @Inject(REVOKE_CLINIC_MEMBERSHIP_USE_CASE)
    private readonly revokeClinicMembershipUseCase: RevokeClinicMembershipPort,
  ) { }

  @Get()
  @ApiOperation({
    summary: "List memberships in a clinic (Clinic admin or Platform admin)",
  })
  @ApiOkResponse({ type: ClinicMembershipResponseDto, isArray: true })
  async listMemberships(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ClinicMembershipResponseDto[]> {
    this.assertCanManageMemberships(user, clinicId);

    const memberships =
      await this.listClinicMembershipsUseCase.execute(clinicId);
    return memberships.map(ClinicMembershipResponseDto.fromDomain);
  }

  @Post()
  @ApiOperation({
    summary: "Assign a user to a clinic (Clinic admin or Platform admin)",
    description:
      "Assigns a membership in a clinic to an existing user by userId, or pre-provisions a new user by issuer and subject.",
  })
  @ApiCreatedResponse({ type: ClinicMembershipResponseDto })
  @ApiConflictResponse({ description: "User already has a membership in this clinic" })
  @ApiNotFoundResponse({ description: "User or clinic not found" })
  async assignMembership(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @Body() dto: AssignClinicMembershipRequestDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ClinicMembershipResponseDto> {
    this.assertCanManageMemberships(user, clinicId);

    if (!dto.userId && (!dto.issuer || !dto.subject)) {
      throw new BadRequestException(
        "Either userId or both issuer and subject must be provided",
      );
    }

    const membership = await this.assignClinicMembershipUseCase.execute(
      clinicId,
      dto.userId ? dto.userId : { issuer: dto.issuer!, subject: dto.subject! },
      dto.role,
    );
    return ClinicMembershipResponseDto.fromDomain(membership);
  }

  @Put(":userId")
  @ApiOperation({
    summary:
      "Update a user's role in a clinic (Clinic admin or Platform admin)",
  })
  @ApiOkResponse({ type: ClinicMembershipResponseDto })
  @ApiNotFoundResponse({ description: "Membership not found" })
  async updateRole(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @Param("userId", new ParseUUIDPipe()) userId: string,
    @Body() dto: UpdateClinicMembershipRequestDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ClinicMembershipResponseDto> {
    this.assertCanManageMemberships(user, clinicId);

    const updated = await this.updateClinicMembershipRoleUseCase.execute(
      clinicId,
      userId,
      dto.role,
    );
    if (!updated) {
      throw new NotFoundException(
        `Membership for user ${userId} in clinic ${clinicId} not found`,
      );
    }
    return ClinicMembershipResponseDto.fromDomain(updated);
  }

  @Delete(":userId")
  @ApiOperation({
    summary: "Revoke a user's membership in a clinic (Clinic admin or Platform admin)",
  })
  @ApiNoContentResponse({ description: "Membership revoked successfully" })
  @ApiNotFoundResponse({ description: "Membership not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeMembership(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @Param("userId", new ParseUUIDPipe()) userId: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<void> {
    this.assertCanManageMemberships(user, clinicId);

    const revoked = await this.revokeClinicMembershipUseCase.execute(
      clinicId,
      userId,
    );
    if (!revoked) {
      throw new NotFoundException(
        `Membership for user ${userId} in clinic ${clinicId} not found`,
      );
    }
  }

  private assertCanManageMemberships(
    user: AuthenticatedUser | undefined,
    clinicId: string,
  ): void {
    if (!user?.accessContext) {
      throw new ForbiddenException(
        "User account is not provisioned or lacks permissions",
      );
    }

    if (
      !isPlatformAdmin(user.accessContext) &&
      !isClinicAdmin(user.accessContext, clinicId)
    ) {
      throw new ForbiddenException(
        "Only clinic administrators of this clinic or platform administrators can manage clinic memberships",
      );
    }
  }
}
