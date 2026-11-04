import { Check, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ClinicRole } from "../../../domain/clinic-membership";
import { UserEntity } from "./user.entity";
import { ClinicEntity } from "../../../../clinics/infrastructure/out/persistence/clinic.entity";

@Entity({ name: "clinic_memberships" })
@Index("UQ_clinic_memberships_user_clinic", ["userId", "clinicId"], { unique: true })
@Check(
    "CHK_clinic_memberships_role",
    `"role" IN ('clinic_user', 'clinic_admin')`,
)
export class ClinicMembershipEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "uuid" })
    userId!: string;

    @Column({ type: "uuid" })
    clinicId!: string;

    @ManyToOne(() => UserEntity, { nullable: false, onDelete: "CASCADE" })
    @JoinColumn({
        name: "userId",
        foreignKeyConstraintName: "FK_clinic_memberships_user",
    })
    user!: UserEntity;

    @ManyToOne(() => ClinicEntity, { nullable: false, onDelete: "CASCADE" })
    @JoinColumn({
        name: "clinicId",
        foreignKeyConstraintName: "FK_clinic_memberships_clinic",
    })
    clinic!: ClinicEntity;

    @Column({ type: "varchar", length: 20 })
    role!: ClinicRole;
}

