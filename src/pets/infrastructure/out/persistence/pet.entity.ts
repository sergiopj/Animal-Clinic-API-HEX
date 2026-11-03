import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Gender, Species } from "../../../domain/pet";

@Entity({ name: "pets" })
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
