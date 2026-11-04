import { Check, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Gender, Species } from "../../../domain/pet";
import { ClinicEntity } from "../../../../clinics/infrastructure/out/persistence/clinic.entity";

@Entity({ name: "pets" })
@Index("IDX_pets_clinicId", ["clinicId"])
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

  @Column({ type: "uuid", nullable: false })
  clinicId!: string;

  @ManyToOne(() => ClinicEntity, { nullable: false, onDelete: "RESTRICT" })
  @JoinColumn({
    name: "clinicId",
    foreignKeyConstraintName: "FK_pets_clinic",
  })
  clinic?: ClinicEntity;
}
