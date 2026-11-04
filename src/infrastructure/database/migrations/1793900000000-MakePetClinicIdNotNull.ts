import { MigrationInterface, QueryRunner } from "typeorm";

export class MakePetClinicIdNotNull1793900000000 implements MigrationInterface {
  name = "MakePetClinicIdNotNull1793900000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const rows = await queryRunner.query(
      `SELECT COUNT(*)::int AS count FROM "pets" WHERE "clinicId" IS NULL`,
    );
    const orphanCount = Number(rows[0]?.count ?? 0);
    if (orphanCount > 0) {
      throw new Error(
        `Cannot apply migration: found ${orphanCount} pet(s) with NULL clinicId. Run the backfill script before running migrations.`,
      );
    }
    await queryRunner.query(
      `ALTER TABLE "pets" ALTER COLUMN "clinicId" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pets" ALTER COLUMN "clinicId" DROP NOT NULL`,
    );
  }
}
