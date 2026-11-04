import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { CreateClinicAddressRequestDto } from "./create-clinic-address.dto";

export class UpdateClinicRequestDto {
  @ApiPropertyOptional({ example: "barruelos clinic center" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ type: CreateClinicAddressRequestDto })
  @ValidateNested()
  @Type(() => CreateClinicAddressRequestDto)
  @IsOptional()
  address?: CreateClinicAddressRequestDto;

  @ApiPropertyOptional({
    example: "+34600123456",
    description: "Contact phone number in international E.164 format",
  })
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/)
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ format: "email", example: "contact@clinic.example" })
  @IsEmail()
  @IsOptional()
  contactEmail?: string;
}

