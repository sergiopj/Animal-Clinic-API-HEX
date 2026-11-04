import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { ClinicRole } from "../../../../domain/clinic-membership";

export class UpdateClinicMembershipRequestDto {
  @ApiProperty({
    enum: ClinicRole,
    example: ClinicRole.Admin,
    description: "New clinic role: clinic_user or clinic_admin",
  })
  @IsEnum(ClinicRole)
  @IsNotEmpty()
  role!: ClinicRole;
}

