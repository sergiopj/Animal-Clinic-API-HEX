import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { ClinicCountryCode } from "../../../../domain/clinic";

export class CreateClinicAddressRequestDto {

    @ApiProperty({ example: "paseo rogativas, n 123" })
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    street!: string;

    @ApiProperty({ example: "Sevilla" })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    city!: string;

    @ApiProperty({ example: "41001" })
    @IsString()
    @IsNotEmpty()
    @MaxLength(15)
    postalCode!: string;

    @ApiProperty({ enum: ClinicCountryCode, example: ClinicCountryCode.Spain })
    @IsEnum(ClinicCountryCode)
    countryCode!: ClinicCountryCode;

    @ApiProperty({ example: "Andalucia" })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    region!: string;



}