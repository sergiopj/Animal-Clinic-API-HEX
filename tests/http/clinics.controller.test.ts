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
import { CREATE_CLINIC_USE_CASE } from "../../src/clinics/application/ports/in/create-clinic.port";
import { DEACTIVATE_CLINIC_USE_CASE } from "../../src/clinics/application/ports/in/deactivate-clinic.port";
import { GET_ALL_CLINICS_USE_CASE } from "../../src/clinics/application/ports/in/get-all-clinics.port";
import { GET_CLINIC_BY_ID_USE_CASE } from "../../src/clinics/application/ports/in/get-clinic-by-id.port";
import { UPDATE_CLINIC_USE_CASE } from "../../src/clinics/application/ports/in/update-clinic.port";
import { Clinic, ClinicCountryCode, ClinicStatus } from "../../src/clinics/domain/clinic";
import { ClinicsController } from "../../src/clinics/infrastructure/in/http/clinics.controller";
import { ClinicRole } from "../../src/users/domain/clinic-membership";
import { PlatformRole } from "../../src/users/domain/user";

describe("ClinicsController (HTTP Integration)", () => {
  let app: INestApplication;
  let currentUser: AuthenticatedUser | null = null;
  let isRequestAuthenticated = true;

  const clinicAId = "a0000000-0000-4000-8000-000000000001";
  const clinicBId = "a0000000-0000-4000-8000-000000000002";

  const sampleClinicA: Clinic = {
    id: clinicAId,
    name: "Central Pet Care",
    address: {
      street: "Paseo de Gracia, 123",
      city: "Barcelona",
      postalCode: "08008",
      countryCode: ClinicCountryCode.Spain,
      region: "Catalonia",
    },
    phone: "+34931234567",
    contactEmail: "central@example.com",
    status: ClinicStatus.Active,
  };

  const sampleClinicB: Clinic = {
    ...sampleClinicA,
    id: clinicBId,
    name: "Northside Animal Hospital",
  };

  const mockCreateClinicUseCase = { execute: jest.fn<any>() };
  const mockGetAllClinicsUseCase = { execute: jest.fn<any>() };
  const mockGetClinicByIdUseCase = { execute: jest.fn<any>() };
  const mockUpdateClinicUseCase = { execute: jest.fn<any>() };
  const mockDeactivateClinicUseCase = { execute: jest.fn<any>() };

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
      controllers: [ClinicsController],
      providers: [
        { provide: CREATE_CLINIC_USE_CASE, useValue: mockCreateClinicUseCase },
        { provide: GET_ALL_CLINICS_USE_CASE, useValue: mockGetAllClinicsUseCase },
        { provide: GET_CLINIC_BY_ID_USE_CASE, useValue: mockGetClinicByIdUseCase },
        { provide: UPDATE_CLINIC_USE_CASE, useValue: mockUpdateClinicUseCase },
        {
          provide: DEACTIVATE_CLINIC_USE_CASE,
          useValue: mockDeactivateClinicUseCase,
        },
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

  it("returns 401 Unauthorized when unauthenticated", async () => {
    isRequestAuthenticated = false;
    const res = await request(app.getHttpServer()).get("/clinics");
    expect(res.status).toBe(401);
  });

  it("returns 403 Forbidden when user is unprovisioned in local database", async () => {
    currentUser = {
      issuer: "https://auth0.example.com/",
      subject: "auth0|unprovisioned",
      scopes: [],
      accessContext: null,
    };
    const res = await request(app.getHttpServer()).get("/clinics");
    expect(res.status).toBe(403);
  });

  it("returns 403 Forbidden when a clinic_admin tries to create a clinic", async () => {
    currentUser = {
      issuer: "https://auth0.example.com/",
      subject: "auth0|clinicadmin",
      scopes: [],
      accessContext: {
        user: {
          id: "u-admin",
          issuer: "https://auth0.example.com/",
          subject: "auth0|clinicadmin",
        },
        clinicMemberships: [
          {
            clinicId: clinicAId,
            userId: "u-admin",
            role: ClinicRole.Admin,
          },
        ],
      },
    };

    const res = await request(app.getHttpServer())
      .post("/clinics")
      .send({
        name: "New Clinic",
        address: sampleClinicA.address,
        phone: "+34600123456",
        contactEmail: "new@example.com",
      });

    expect(res.status).toBe(403);
    expect(mockCreateClinicUseCase.execute).not.toHaveBeenCalled();
  });

  it("returns 201 Created when platform_admin creates a clinic", async () => {
    currentUser = {
      issuer: "https://auth0.example.com/",
      subject: "auth0|platformadmin",
      scopes: [],
      accessContext: {
        user: {
          id: "u-platform",
          issuer: "https://auth0.example.com/",
          subject: "auth0|platformadmin",
          platformRole: PlatformRole.Admin,
        },
        clinicMemberships: [],
      },
    };

    mockCreateClinicUseCase.execute.mockResolvedValue(sampleClinicA);

    const res = await request(app.getHttpServer())
      .post("/clinics")
      .send({
        name: "Central Pet Care",
        address: sampleClinicA.address,
        phone: "+34600123456",
        contactEmail: "central@example.com",
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(clinicAId);
  });

  it("returns 200 with all clinics for platform_admin", async () => {
    currentUser = {
      issuer: "https://auth0.example.com/",
      subject: "auth0|platformadmin",
      scopes: [],
      accessContext: {
        user: {
          id: "u-platform",
          issuer: "https://auth0.example.com/",
          subject: "auth0|platformadmin",
          platformRole: PlatformRole.Admin,
        },
        clinicMemberships: [],
      },
    };

    mockGetAllClinicsUseCase.execute.mockResolvedValue([
      sampleClinicA,
      sampleClinicB,
    ]);

    const res = await request(app.getHttpServer()).get("/clinics");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(mockGetAllClinicsUseCase.execute).toHaveBeenCalledWith();
  });

  it("returns 200 with only authorized clinics for clinic staff", async () => {
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

    mockGetAllClinicsUseCase.execute.mockResolvedValue([sampleClinicA]);

    const res = await request(app.getHttpServer()).get("/clinics");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(mockGetAllClinicsUseCase.execute).toHaveBeenCalledWith([clinicAId]);
  });

  it("returns 404 Not Found without leaking existence when clinic user requests unauthorized clinic by ID", async () => {
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

    // User is only member of clinicA, but requests clinicB
    const res = await request(app.getHttpServer()).get(`/clinics/${clinicBId}`);
    expect(res.status).toBe(404);
    expect(mockGetClinicByIdUseCase.execute).not.toHaveBeenCalled();
  });

  it("returns 200 when clinic user requests authorized clinic by ID", async () => {
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

    mockGetClinicByIdUseCase.execute.mockResolvedValue(sampleClinicA);

    const res = await request(app.getHttpServer()).get(`/clinics/${clinicAId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(clinicAId);
  });

  it("returns 200 when platform_admin updates a clinic", async () => {
    currentUser = {
      issuer: "https://auth0.example.com/",
      subject: "auth0|platformadmin",
      scopes: [],
      accessContext: {
        user: {
          id: "u-platform",
          issuer: "https://auth0.example.com/",
          subject: "auth0|platformadmin",
          platformRole: PlatformRole.Admin,
        },
        clinicMemberships: [],
      },
    };

    const updated = { ...sampleClinicA, name: "Central Pet Care Updated" };
    mockUpdateClinicUseCase.execute.mockResolvedValue(updated);

    const res = await request(app.getHttpServer())
      .put(`/clinics/${clinicAId}`)
      .send({ name: "Central Pet Care Updated" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Central Pet Care Updated");
  });

  it("returns 204 NoContent when platform_admin deactivates a clinic", async () => {
    currentUser = {
      issuer: "https://auth0.example.com/",
      subject: "auth0|platformadmin",
      scopes: [],
      accessContext: {
        user: {
          id: "u-platform",
          issuer: "https://auth0.example.com/",
          subject: "auth0|platformadmin",
          platformRole: PlatformRole.Admin,
        },
        clinicMemberships: [],
      },
    };

    mockDeactivateClinicUseCase.execute.mockResolvedValue(true);

    const res = await request(app.getHttpServer()).delete(
      `/clinics/${clinicAId}`,
    );
    expect(res.status).toBe(204);
  });
});
