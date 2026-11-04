import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersAndClinicMemberships1793794725043 implements MigrationInterface {
    name = 'CreateUsersAndClinicMemberships1793794725043'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "issuer" character varying(255) NOT NULL, "subject" character varying(255) NOT NULL, "platformRole" character varying(20), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_users_issuer_subject" ON "users"  ("issuer", "subject") `);
        await queryRunner.query(`CREATE TABLE "clinic_memberships" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "clinicId" uuid NOT NULL, "role" character varying(20) NOT NULL, CONSTRAINT "CHK_clinic_memberships_role" CHECK ("role" IN ('clinic_user', 'clinic_admin')), CONSTRAINT "PK_2f55034f99beeed0887a4c994c6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_clinic_memberships_user_clinic" ON "clinic_memberships"  ("userId", "clinicId") `);
        await queryRunner.query(`ALTER TABLE "clinics" ADD CONSTRAINT "CHK_clinics_country_code" CHECK ("countryCode" IN ('ES', 'PT', 'GB'))`);
        await queryRunner.query(`ALTER TABLE "clinics" ADD CONSTRAINT "CHK_clinics_status" CHECK ("status" IN ('active', 'inactive'))`);
        await queryRunner.query(`ALTER TABLE "pets" ADD CONSTRAINT "CHK_pets_species" CHECK ("species" IN ('dog', 'cat', 'fish', 'bird', 'reptile'))`);
        await queryRunner.query(`ALTER TABLE "pets" ADD CONSTRAINT "CHK_pets_gender" CHECK ("gender" IN ('male', 'female'))`);
        await queryRunner.query(`ALTER TABLE "clinic_memberships" ADD CONSTRAINT "FK_clinic_memberships_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clinic_memberships" ADD CONSTRAINT "FK_clinic_memberships_clinic" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clinic_memberships" DROP CONSTRAINT "FK_clinic_memberships_clinic"`);
        await queryRunner.query(`ALTER TABLE "clinic_memberships" DROP CONSTRAINT "FK_clinic_memberships_user"`);
        await queryRunner.query(`ALTER TABLE "pets" DROP CONSTRAINT "CHK_pets_gender"`);
        await queryRunner.query(`ALTER TABLE "pets" DROP CONSTRAINT "CHK_pets_species"`);
        await queryRunner.query(`ALTER TABLE "clinics" DROP CONSTRAINT "CHK_clinics_status"`);
        await queryRunner.query(`ALTER TABLE "clinics" DROP CONSTRAINT "CHK_clinics_country_code"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_clinic_memberships_user_clinic"`);
        await queryRunner.query(`DROP TABLE "clinic_memberships"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_users_issuer_subject"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
