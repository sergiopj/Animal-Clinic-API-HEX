import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PlatformRole, User } from "../../../../domain/user";

export class UserResponseDto {
  @ApiProperty({
    format: "uuid",
    example: "b3b0b3b1-5b2a-4b2a-9b1a-123456789abc",
  })
  id!: string;

  @ApiProperty({ example: "https://dev-tenant.auth0.com/" })
  issuer!: string;

  @ApiProperty({ example: "auth0|64f1a2b3c4d5e6f7a8b9c0d1" })
  subject!: string;

  @ApiPropertyOptional({
    enum: PlatformRole,
    example: PlatformRole.Admin,
  })
  platformRole?: PlatformRole;

  static fromDomain(user: User): UserResponseDto {
    return {
      id: user.id,
      issuer: user.issuer,
      subject: user.subject,
      platformRole: user.platformRole,
    };
  }
}

