import { ApiProperty } from "@nestjs/swagger";
import { Gender, Species } from "../../../../domain/pet";
import { IsDateString, IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class UpdatePetRequestDto {

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
}