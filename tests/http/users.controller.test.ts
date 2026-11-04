import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AuthenticatedUser } from "../../src/auth/authenticated-user";
import { LIST_USERS_USE_CASE } from "../../src/users/application/ports/in/list-users.port";
import { ClinicRole } from "../../src/users/domain/clinic-membership";
import { PlatformRole, User } from "../../src/users/domain/user";
import { UsersController } from "../../src/users/infrastructure/in/http/users.controller";

describe("UsersController (HTTP Integration)", () => {
  let app: INestApplication;
  let currentUser: AuthenticatedUser | null = null;
  let isRequestAuthenticated = true;

  const mockListUsersUseCase = { execute: jest.fn<any>() };

  const sampleUser: User = {
    id: "b0000000-0000-4000-8000-000000000001",
    issuer: "https://auth0.example.com/",
    subject: "auth0|u1",
  };

  const mockGuard: CanActivate = {
    canActivate: (context: ExecutionContext) => {
      if (!isRequestAuthenticated) {
        throw new UnauthorizedException("Missing or invalid token");
      }
      const req = context.switchToHttp().getRequest();
      req.user = currentUser;
      return true;
    },
  };

  beforeEach(async () => {
    isRequestAuthenticated = true;
    currentUser = null;
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: LIST_USERS_USE_CASE, useValue: mockListUsersUseCase },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalGuards(mockGuard);
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it("returns 401 when unauthenticated", async () => {
    isRequestAuthenticated = false;
    const res = await request(app.getHttpServer()).get("/users/me");
    expect(res.status).toBe(401);
  });

  it("returns 403 Forbidden for GET /users/me when identity is unprovisioned", async () => {
    currentUser = {
      issuer: "https://auth0.example.com/",
      subject: "auth0|unprovisioned",
      scopes: [],
      accessContext: null,
    };

    const res = await request(app.getHttpServer()).get("/users/me");
    expect(res.status).toBe(403);
  });

  it("returns 403 Forbidden for GET /users if user is not platform_admin", async () => {
    currentUser = {
      issuer: "https://auth0.example.com/",
      subject: "auth0|u1",
      scopes: [],
      accessContext: {
        user: sampleUser,
        clinicMemberships: [],
      },
    };

    const res = await request(app.getHttpServer()).get("/users");
    expect(res.status).toBe(403);
    expect(mockListUsersUseCase.execute).not.toHaveBeenCalled();
  });

  it("returns 200 for GET /users for platform_admin", async () => {
    currentUser = {
      issuer: "https://auth0.example.com/",
      subject: "auth0|admin",
      scopes: [],
      accessContext: {
        user: { ...sampleUser, platformRole: PlatformRole.Admin },
        clinicMemberships: [],
      },
    };

    mockListUsersUseCase.execute.mockResolvedValue([sampleUser]);

    const res = await request(app.getHttpServer()).get("/users");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(sampleUser.id);
  });

  it("returns 200 for GET /users/me with current user profile and memberships", async () => {
    currentUser = {
      issuer: "https://auth0.example.com/",
      subject: "auth0|u1",
      scopes: [],
      accessContext: {
        user: sampleUser,
        clinicMemberships: [
          {
            clinicId: "a0000000-0000-4000-8000-000000000001",
            userId: sampleUser.id,
            role: ClinicRole.User,
          },
        ],
      },
    };

    const res = await request(app.getHttpServer()).get("/users/me");
    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(sampleUser.id);
    expect(res.body.clinicMemberships).toHaveLength(1);
    expect(res.body.clinicMemberships[0].clinicId).toBe(
      "a0000000-0000-4000-8000-000000000001",
    );
  });
});

