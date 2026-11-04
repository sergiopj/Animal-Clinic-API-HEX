import { ApiPropertyOptional } from "@nestjs/swagger";
import { Gender, Species } from "../../../../domain/pet";
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";

export class UpdatePetRequestDto {
  @ApiPropertyOptional({ example: "Luna" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ enum: Species, example: "dog" })
  @IsEnum(Species)
  species!: Species;

  @ApiPropertyOptional({ enum: Gender, example: "female" })
  @IsEnum(Gender)
  gender!: Gender;

  @ApiPropertyOptional({ format: "date", example: "2020-03-15" })
  @IsDateString()
  birthdate!: string;

  @ApiPropertyOptional({
    format: "uuid",
    example: "b3b0b3b1-5b2a-4b2a-9b1a-123456789abc",
  })
  @IsUUID()
  @IsOptional()
  clinicId?: string;
}
