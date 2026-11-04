import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "../users/users.module";
import { Auth0JwtAuthGuard } from "./guards/auth0-jwt-auth.guard";
import { Auth0JwtStrategy } from "./strategies/auth0-jwt.strategy";

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: "auth0-jwt" }),
    UsersModule,
  ],
  providers: [
    Auth0JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: Auth0JwtAuthGuard,
    },
  ],
  exports: [PassportModule],
})
export class AuthModule {}
