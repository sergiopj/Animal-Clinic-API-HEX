import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { PlatformRole } from "../../../domain/user";

@Entity({ name: "users" })
@Index("UQ_users_issuer_subject", ["issuer", "subject"], { unique: true })
export class UserEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255 })
    issuer!: string;

    @Column({ type: "varchar", length: 255 })
    subject!: string;

    @Column({ type: "varchar", length: 20, nullable: true })
    platformRole?: PlatformRole;

}
