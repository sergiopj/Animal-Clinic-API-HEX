import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ClinicStatus } from "../../../domain/clinic";
import { ClinicCountryCode } from "../../../domain/clinic-address";

@Entity({ name: "clinics" })
export class ClinicEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "varchar", length: 20 })
  status!: ClinicStatus;

  @Column({ type: "varchar", length: 150 })
  street!: string;

  @Column({ type: "varchar", length: 100 })
  city!: string;

  @Column({ type: "varchar", length: 15 })
  postalCode!: string;

  @Column({ type: "varchar", length: 2 })
  countryCode!: ClinicCountryCode;

  @Column({ type: "varchar", length: 100 })
  region!: string;

  @Column({ type: "varchar", length: 20 })
  phone!: string;

  @Column({ type: "varchar", length: 254 })
  contactEmail!: string;
}
