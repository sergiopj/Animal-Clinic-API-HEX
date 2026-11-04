import { ApiProperty } from "@nestjs/swagger";
import {
  ClinicMembership,
  ClinicRole,
} from "../../../../domain/clinic-membership";

export class ClinicMembershipResponseDto {
  @ApiProperty({
    format: "uuid",
    example: "b3b0b3b1-5b2a-4b2a-9b1a-123456789abc",
  })
  userId!: string;

  @ApiProperty({
    format: "uuid",
    example: "a1a0b3b1-5b2a-4b2a-9b1a-987654321def",
  })
  clinicId!: string;

  @ApiProperty({
    enum: ClinicRole,
    example: ClinicRole.User,
  })
  role!: ClinicRole;

  static fromDomain(
    membership: ClinicMembership,
  ): ClinicMembershipResponseDto {
    return {
      userId: membership.userId,
      clinicId: membership.clinicId,
      role: membership.role,
    };
  }
}

