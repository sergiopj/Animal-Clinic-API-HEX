import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClinicIdToPets1793800000000 implements MigrationInterface {
  name = "AddClinicIdToPets1793800000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pets" ADD "clinicId" uuid`);
    await queryRunner.query(
      `CREATE INDEX "IDX_pets_clinicId" ON "pets" ("clinicId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "pets" ADD CONSTRAINT "FK_pets_clinic" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pets" DROP CONSTRAINT "FK_pets_clinic"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_pets_clinicId"`);
    await queryRunner.query(`ALTER TABLE "pets" DROP COLUMN "clinicId"`);
  }
}

