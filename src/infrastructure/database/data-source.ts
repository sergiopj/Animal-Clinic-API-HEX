import "dotenv/config";
import { DataSource } from "typeorm";
import { ClinicEntity } from "../../clinics/infrastructure/out/persistence/clinic.entity";
import { PetEntity } from "../../pets/infrastructure/out/persistence/pet.entity";

export default new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [PetEntity, ClinicEntity],
  migrations: ["src/infrastructure/database/migrations/*.ts"],
  synchronize: false,
});
