import { ApiProperty } from "@nestjs/swagger";
import { ClinicCountryCode } from "../../../../domain/clinic";

export class ClinicAddressResponseDto {
    @ApiProperty({ example: "Paseo Rogativas, 123" })
    street!: string;

    @ApiProperty({ example: "Sevilla" })
    city!: string;

    @ApiProperty({ example: "41001" })
    postalCode!: string;

    @ApiProperty({ enum: ClinicCountryCode, example: ClinicCountryCode.Spain })
    countryCode!: ClinicCountryCode;

    @ApiProperty({ example: "Andalucía" })
    region!: string;
}