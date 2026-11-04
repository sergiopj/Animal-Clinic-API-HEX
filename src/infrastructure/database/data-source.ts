import "dotenv/config";
import { DataSource } from "typeorm";
import { ClinicEntity } from "../../clinics/infrastructure/out/persistence/clinic.entity";
import { PetEntity } from "../../pets/infrastructure/out/persistence/pet.entity";
import { ClinicMembershipEntity } from "../../users/infrastructure/out/persistence/clinic-membership.entity";
import { UserEntity } from "../../users/infrastructure/out/persistence/user.entity";

export default new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [PetEntity, ClinicEntity, UserEntity, ClinicMembershipEntity],
  migrations: ["src/infrastructure/database/migrations/*.ts"],
  synchronize: false,
});
