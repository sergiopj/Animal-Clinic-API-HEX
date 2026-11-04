import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { ClinicRole } from "../../../../domain/clinic-membership";

export class AssignClinicMembershipRequestDto {
  @ApiPropertyOptional({
    format: "uuid",
    example: "b3b0b3b1-5b2a-4b2a-9b1a-123456789abc",
    description: "ID of an existing provisioned user (either userId or issuer+subject is required)",
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    example: "https://auth0.example.com/",
    description: "Auth0 issuer URL for pre-provisioning (required if userId is not provided)",
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  issuer?: string;

  @ApiPropertyOptional({
    example: "auth0|654321fedcba",
    description: "Auth0 subject (sub) claim for pre-provisioning (required if userId is not provided)",
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  subject?: string;

  @ApiProperty({
    enum: ClinicRole,
    example: ClinicRole.User,
    description: "Clinic role: clinic_user or clinic_admin",
  })
  @IsEnum(ClinicRole)
  @IsNotEmpty()
  role!: ClinicRole;
}
