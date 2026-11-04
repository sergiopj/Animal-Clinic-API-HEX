import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { AuthModule } from "./auth/auth.module";
import { PetsModule } from "./pets/pets.module";
import { ClinicsModule } from "./clinics/clinics.module";
import { DatabaseModule } from "./infrastructure/database/database.module";
import { UsersModule } from "./users/users.module";
import { ProblemDetailsExceptionFilter } from "./infrastructure/database/http/filters/problem-details-exception.filter";

@Module({
  imports: [AuthModule, PetsModule, ClinicsModule, DatabaseModule, UsersModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ProblemDetailsExceptionFilter,
    },
  ],
})
export class NestAppModule {}
