import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { CreateClinicAddressRequestDto } from "./create-clinic-address.dto";

export class CreateClinicRequestDto {

    @ApiProperty({ example: "barruelos clinic center" })
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    name!: string;

    @ApiProperty({ type: CreateClinicAddressRequestDto })
    @ValidateNested()
    @Type(() => CreateClinicAddressRequestDto)
    address!: CreateClinicAddressRequestDto;

    @ApiProperty({
        example: "+34600123456",
        description: "Contact phone number in international E.164 format",
    })
    @IsString()
    @Matches(/^\+[1-9]\d{7,14}$/)
    phone!: string;

    @ApiProperty({ format: "email", example: "contact@clinic.example" })
    @IsEmail()
    contactEmail!: string;
}