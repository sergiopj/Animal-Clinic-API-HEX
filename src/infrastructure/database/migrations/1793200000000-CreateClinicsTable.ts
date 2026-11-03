import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateClinicsTable1793200000000 implements MigrationInterface {
  name = "CreateClinicsTable1793200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "clinics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(150) NOT NULL, "status" character varying(20) NOT NULL, "street" character varying(150) NOT NULL, "city" character varying(100) NOT NULL, "postalCode" character varying(15) NOT NULL, "countryCode" character varying(2) NOT NULL, "region" character varying(100) NOT NULL, "phone" character varying(20) NOT NULL, "contactEmail" character varying(254) NOT NULL, CONSTRAINT "PK_clinics_id" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "clinics"`);
  }
}
