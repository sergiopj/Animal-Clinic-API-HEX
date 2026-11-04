import { Check, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Gender, Species } from "../../../domain/pet";

@Entity({ name: "pets" })
@Check("CHK_pets_gender", `"gender" IN ('male', 'female')`)
@Check("CHK_pets_species", `"species" IN ('dog', 'cat', 'fish', 'bird', 'reptile')`)
export class PetEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 20 })
  species!: Species;

  @Column({ type: "varchar", length: 20 })
  gender!: Gender;

  @Column({ type: "date" })
  birthdate!: string;
}
