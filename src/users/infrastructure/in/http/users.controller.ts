import {
  Controller,
  ForbiddenException,
  Get,
  Inject,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { AuthenticatedUser } from "../../../../auth/authenticated-user";
import { CurrentUser } from "../../../../auth/decorators/current-user.decorator";
import { isPlatformAdmin } from "../../../application/access-context";
import {
  LIST_USERS_USE_CASE,
  ListUsersPort,
} from "../../../application/ports/in/list-users.port";
import { ClinicMembershipResponseDto } from "./dto/clinic-membership-response.dto";
import { UserResponseDto } from "./dto/user-response.dto";

export class CurrentUserProfileResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto;

  @ApiProperty({ type: ClinicMembershipResponseDto, isArray: true })
  clinicMemberships!: ClinicMembershipResponseDto[];
}

@Controller("users")
@ApiTags("Users")
@ApiBearerAuth("bearerAuth")
@ApiUnauthorizedResponse({ description: "Missing or invalid access token" })
@ApiForbiddenResponse({
  description: "User lacks permissions for this operation",
})
export class UsersController {
  constructor(
    @Inject(LIST_USERS_USE_CASE)
    private readonly listUsersUseCase: ListUsersPort,
  ) { }

  @Get()
  @ApiOperation({ summary: "List all provisioned users (Platform admin only)" })
  @ApiOkResponse({ type: UserResponseDto, isArray: true })
  async listUsers(
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<UserResponseDto[]> {
    if (!user?.accessContext || !isPlatformAdmin(user.accessContext)) {
      throw new ForbiddenException(
        "Only platform administrators can list provisioned users",
      );
    }

    const users = await this.listUsersUseCase.execute();
    return users.map(UserResponseDto.fromDomain);
  }

  @Get("me")
  @ApiOperation({
    summary: "Get current authenticated user identity and clinic memberships",
  })
  @ApiOkResponse({ type: CurrentUserProfileResponseDto })
  async getMe(
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<CurrentUserProfileResponseDto> {
    if (!user?.accessContext) {
      throw new ForbiddenException(
        "User account is not provisioned in local database",
      );
    }

    return {
      user: UserResponseDto.fromDomain(user.accessContext.user),
      clinicMemberships: user.accessContext.clinicMemberships.map(
        ClinicMembershipResponseDto.fromDomain,
      ),
    };
  }
}

