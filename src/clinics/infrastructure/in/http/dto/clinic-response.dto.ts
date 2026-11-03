import { ApiProperty } from "@nestjs/swagger";
import { Clinic, ClinicStatus } from "../../../../domain/clinic";
import { ClinicAddressResponseDto } from "./clinic-address-response.dto";

export class ClinicResponseDto {
  @ApiProperty({
    format: "uuid",
    example: "b3b0b3b1-5b2a-4b2a-9b1a-123456789abc",
  })
  id!: string;

  @ApiProperty({ example: "barruelos clinic center" })
  name!: string;

  @ApiProperty({ enum: ClinicStatus, example: "active" })
  status!: ClinicStatus;

  @ApiProperty({ type: ClinicAddressResponseDto })
  address!: ClinicAddressResponseDto;

  @ApiProperty({ example: "+34600123456" })
  phone!: string;

  @ApiProperty({ format: "email", example: "contact@clinic.example" })
  contactEmail!: string;

  static fromDomain(clinic: Clinic): ClinicResponseDto {
    return {
      id: clinic.id,
      name: clinic.name,
      status: clinic.status,
      address: {
        street: clinic.address.street,
        city: clinic.address.city,
        postalCode: clinic.address.postalCode,
        countryCode: clinic.address.countryCode,
        region: clinic.address.region,
      },
      phone: clinic.phone,
      contactEmail: clinic.contactEmail,
    };
  }
}
