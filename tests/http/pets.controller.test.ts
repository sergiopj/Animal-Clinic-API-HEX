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
import { CREATE_PET_USE_CASE } from "../../src/pets/application/ports/in/create-pet.port";
import { DELETE_PET_USE_CASE } from "../../src/pets/application/ports/in/delete-pet.port";
import { GET_ALL_PETS_USE_CASE } from "../../src/pets/application/ports/in/get-all-pets.port";
import { GET_BY_ID_PET_USE_CASE } from "../../src/pets/application/ports/in/get-by-id-pet.port";
import { UPDATE_PET_USE_CASE } from "../../src/pets/application/ports/in/update-pet.port";
import { Gender, Pet, Species } from "../../src/pets/domain/pet";
import { PetsController } from "../../src/pets/infrastructure/in/http/pets.controller";
import { ClinicRole } from "../../src/users/domain/clinic-membership";
import { PlatformRole } from "../../src/users/domain/user";

describe("PetsController (HTTP Integration)", () => {
  let app: INestApplication;
  let currentUser: AuthenticatedUser | null = null;
  let isRequestAuthenticated = true;

  const clinicAId = "a0000000-0000-4000-8000-000000000001";
  const clinicBId = "a0000000-0000-4000-8000-000000000002";
  const petAId = "b0000000-0000-4000-8000-000000000001";

  const samplePetA: Pet = {
    id: petAId,
    name: "Max",
    species: Species.Dog,
    gender: Gender.Male,
    birthdate: "2021-05-10",
    clinicId: clinicAId,
  };

  const mockGetAllPetsUseCase = { execute: jest.fn<any>() };
  const mockGetByIdPetUseCase = { execute: jest.fn<any>() };
  const mockCreatePetUseCase = { execute: jest.fn<any>() };
  const mockUpdatePetUseCase = { execute: jest.fn<any>() };
  const mockDeletePetUseCase = { execute: jest.fn<any>() };

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
      controllers: [PetsController],
      providers: [
        { provide: GET_ALL_PETS_USE_CASE, useValue: mockGetAllPetsUseCase },
        { provide: GET_BY_ID_PET_USE_CASE, useValue: mockGetByIdPetUseCase },
        { provide: CREATE_PET_USE_CASE, useValue: mockCreatePetUseCase },
        { provide: UPDATE_PET_USE_CASE, useValue: mockUpdatePetUseCase },
        { provide: DELETE_PET_USE_CASE, useValue: mockDeletePetUseCase },
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

  it("returns 401 Unauthorized when request has no valid token", async () => {
    isRequestAuthenticated = false;

    const res = await request(app.getHttpServer()).get("/pets");
    expect(res.status).toBe(401);
  });

  it("returns 403 Forbidden when user is authenticated but not provisioned in local database", async () => {
    currentUser = {
      issuer: "https://auth0.example.com/",
      subject: "auth0|unprovisioned",
      scopes: [],
      accessContext: null,
    };

    const res = await request(app.getHttpServer()).get("/pets");
    expect(res.status).toBe(403);
    expect(res.body.message).toContain("not provisioned");
  });

  it("returns 200 with pets scoped to the user's authorized clinics", async () => {
    currentUser = {
      issuer: "https://auth0.example.com/",
      subject: "auth0|user1",
      scopes: [],
      accessContext: {
        user: {
          id: "u1",
          issuer: "https://auth0.example.com/",
          subject: "auth0|user1",
        },
        clinicMemberships: [
          {
            clinicId: clinicAId,
            userId: "u1",
            role: ClinicRole.User,
          },
        ],
      },
    };

    mockGetAllPetsUseCase.execute.mockResolvedValue([samplePetA]);

    const res = await request(app.getHttpServer()).get("/pets");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(petAId);
    expect(mockGetAllPetsUseCase.execute).toHaveBeenCalledWith([clinicAId]);
  });

  it("returns 403 Forbidden when clinic user attempts to filter by an unauthorized clinic", async () => {
    currentUser = {
      issuer: "https://auth0.example.com/",
      subject: "auth0|user1",
      scopes: [],
      accessContext: {
        user: {
          id: "u1",
          issuer: "https://auth0.example.com/",
          subject: "auth0|user1",
        },
        clinicMemberships: [
          {
            clinicId: clinicAId,
            userId: "u1",
            role: ClinicRole.User,
          },
        ],
      },
    };

    const res = await request(app.getHttpServer()).get(
      `/pets?clinicId=${clinicBId}`,
    );
    expect(res.status).toBe(403);
    expect(res.body.message).toContain("Not authorized");
  });

  it("returns 404 Not Found (without leaking existence) when pet belongs to another clinic", async () => {
    currentUser = {
      issuer: "https://auth0.example.com/",
      subject: "auth0|user1",
      scopes: [],
      accessContext: {
        user: {
          id: "u1",
          issuer: "https://auth0.example.com/",
          subject: "auth0|user1",
        },
        clinicMemberships: [
          {
            clinicId: clinicAId,
            userId: "u1",
            role: ClinicRole.User,
          },
        ],
      },
    };

    // Scoped query with [clinicAId] returns null for pet in clinic B
    mockGetByIdPetUseCase.execute.mockResolvedValue(null);

    const res = await request(app.getHttpServer()).get(`/pets/${petAId}`);
    expect(res.status).toBe(404);
    expect(mockGetByIdPetUseCase.execute).toHaveBeenCalledWith(petAId, [
      clinicAId,
    ]);
  });

  it("returns 201 Created when creating a pet in an authorized clinic", async () => {
    currentUser = {
      issuer: "https://auth0.example.com/",
      subject: "auth0|user1",
      scopes: [],
      accessContext: {
        user: {
          id: "u1",
          issuer: "https://auth0.example.com/",
          subject: "auth0|user1",
        },
        clinicMemberships: [
          {
            clinicId: clinicAId,
            userId: "u1",
            role: ClinicRole.User,
          },
        ],
      },
    };

    mockCreatePetUseCase.execute.mockResolvedValue(samplePetA);

    const res = await request(app.getHttpServer())
      .post("/pets")
      .send({
        name: "Max",
        species: Species.Dog,
        gender: Gender.Male,
        birthdate: "2021-05-10",
        clinicId: clinicAId,
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(petAId);
  });

  it("returns 403 Forbidden when creating a pet in an unauthorized clinic", async () => {
    currentUser = {
      issuer: "https://auth0.example.com/",
      subject: "auth0|user1",
      scopes: [],
      accessContext: {
        user: {
          id: "u1",
          issuer: "https://auth0.example.com/",
          subject: "auth0|user1",
        },
        clinicMemberships: [
          {
            clinicId: clinicAId,
            userId: "u1",
            role: ClinicRole.User,
          },
        ],
      },
    };

    const res = await request(app.getHttpServer())
      .post("/pets")
      .send({
        name: "Max",
        species: Species.Dog,
        gender: Gender.Male,
        birthdate: "2021-05-10",
        clinicId: clinicBId,
      });

    expect(res.status).toBe(403);
    expect(mockCreatePetUseCase.execute).not.toHaveBeenCalled();
  });

  it("platform_admin can access pets across all clinics with unscoped queries", async () => {
    currentUser = {
      issuer: "https://auth0.example.com/",
      subject: "auth0|admin",
      scopes: [],
      accessContext: {
        user: {
          id: "admin-id",
          issuer: "https://auth0.example.com/",
          subject: "auth0|admin",
          platformRole: PlatformRole.Admin,
        },
        clinicMemberships: [],
      },
    };

    mockGetAllPetsUseCase.execute.mockResolvedValue([samplePetA]);
    const res = await request(app.getHttpServer()).get("/pets");
    expect(res.status).toBe(200);
    expect(mockGetAllPetsUseCase.execute).toHaveBeenCalledWith(undefined);

    mockGetByIdPetUseCase.execute.mockResolvedValue(samplePetA);
    const getRes = await request(app.getHttpServer()).get(`/pets/${petAId}`);
    expect(getRes.status).toBe(200);
    expect(mockGetByIdPetUseCase.execute).toHaveBeenCalledWith(
      petAId,
      undefined,
    );
  });
});
