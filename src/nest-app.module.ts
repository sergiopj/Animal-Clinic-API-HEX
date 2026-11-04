import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { PetsModule } from "./pets/pets.module";
import { ClinicsModule } from "./clinics/clinics.module";
import { DatabaseModule } from "./infrastructure/database/database.module";
import { UsersModule } from "./users/users.module";

@Module({ imports: [AuthModule, PetsModule, ClinicsModule, DatabaseModule, UsersModule] })
export class NestAppModule { }
