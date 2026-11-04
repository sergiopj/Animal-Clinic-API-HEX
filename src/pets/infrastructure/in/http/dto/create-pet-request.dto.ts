import { ApiProperty } from "@nestjs/swagger";
import { Gender, Species } from "../../../../domain/pet";
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";

export class CreatePetRequestDto {
  @ApiProperty({ example: "Luna" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ enum: Species, example: "dog" })
  @IsEnum(Species)
  species!: Species;

  @ApiProperty({ enum: Gender, example: "female" })
  @IsEnum(Gender)
  gender!: Gender;

  @ApiProperty({ format: "date", example: "2020-03-15" })
  @IsDateString()
  birthdate!: string;

  @ApiProperty({
    format: "uuid",
    example: "b3b0b3b1-5b2a-4b2a-9b1a-123456789abc",
    description: "Clinic ID to which this pet belongs",
  })
  @IsUUID()
  @IsNotEmpty()
  clinicId!: string;
}
