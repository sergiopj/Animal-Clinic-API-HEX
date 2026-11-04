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
import { ASSIGN_CLINIC_MEMBERSHIP_USE_CASE } from "../../src/users/application/ports/in/assign-clinic-membership.port";
import { LIST_CLINIC_MEMBERSHIPS_USE_CASE } from "../../src/users/application/ports/in/list-clinic-memberships.port";
import { REVOKE_CLINIC_MEMBERSHIP_USE_CASE } from "../../src/users/application/ports/in/revoke-clinic-membership.port";
import { UPDATE_CLINIC_MEMBERSHIP_ROLE_USE_CASE } from "../../src/users/application/ports/in/update-clinic-membership-role.port";
import { ClinicMembership, ClinicRole } from "../../src/users/domain/clinic-membership";
import { PlatformRole } from "../../src/users/domain/user";
import { ClinicMembershipsController } from "../../src/users/infrastructure/in/http/clinic-memberships.controller";

describe("ClinicMembershipsController (HTTP Integration)", () => {
  let app: INestApplication;
  let currentUser: AuthenticatedUser | null = null;
  let isRequestAuthenticated = true;

  const clinicAId = "a0000000-0000-4000-8000-000000000001";
  const clinicBId = "a0000000-0000-4000-8000-000000000002";
  const targetUserId = "b0000000-0000-4000-8000-000000000001";
  const adminUserId = "b0000000-0000-4000-8000-000000000002";

  const sampleMembership: ClinicMembership = {
    clinicId: clinicAId,
    userId: targetUserId,
    role: ClinicRole.User,
  };

  const mockListMembershipsUseCase = { execute: jest.fn<any>() };
  const mockAssignMembershipUseCase = { execute: jest.fn<any>() };
  const mockUpdateRoleUseCase = { execute: jest.fn<any>() };
  const mockRevokeMembershipUseCase = { execute: jest.fn<any>() };

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
      controllers: [ClinicMembershipsController],
      providers: [
        {
          provide: LIST_CLINIC_MEMBERSHIPS_USE_CASE,
          useValue: mockListMembershipsUseCase,
        },
        {
          provide: ASSIGN_CLINIC_MEMBERSHIP_USE_CASE,
          useValue: mockAssignMembershipUseCase,
        },
        {
          provide: UPDATE_CLINIC_MEMBERSHIP_ROLE_USE_CASE,
          useValue: mockUpdateRoleUseCase,
        },
        {
          provide: REVOKE_CLINIC_MEMBERSHIP_USE_CASE,
          useValue: mockRevokeMembershipUseCase,
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
    const res = await request(app.getHttpServer()).get(
      `/clinics/${clinicAId}/memberships`,
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 Forbidden when a regular clinic_user attempts to manage memberships", async () => {
    currentUser = {
      issuer: "https://auth0.example.com/",
      subject: "auth0|regularuser",
      scopes: [],
      accessContext: {
        user: {
          id: targetUserId,
          issuer: "https://auth0.example.com/",
          subject: "auth0|regularuser",
        },
        clinicMemberships: [
          {
            clinicId: clinicAId,
            userId: targetUserId,
            role: ClinicRole.User,
          },
        ],
      },
    };

    const res = await request(app.getHttpServer()).get(
      `/clinics/${clinicAId}/memberships`,
    );
    expect(res.status).toBe(403);
    expect(mockListMembershipsUseCase.execute).not.toHaveBeenCalled();
  });

  it("returns 403 Forbidden when clinic_admin of clinic A attempts to manage clinic B", async () => {
    currentUser = {
      issuer: "https://auth0.example.com/",
      subject: "auth0|adminA",
      scopes: [],
      accessContext: {
        user: {
          id: adminUserId,
          issuer: "https://auth0.example.com/",
          subject: "auth0|adminA",
        },
        clinicMemberships: [
          {
            clinicId: clinicAId,
            userId: adminUserId,
            role: ClinicRole.Admin,
          },
        ],
      },
    };

    const res = await request(app.getHttpServer()).get(
      `/clinics/${clinicBId}/memberships`,
    );
    expect(res.status).toBe(403);
    expect(mockListMembershipsUseCase.execute).not.toHaveBeenCalled();
  });

  it("returns 200 when clinic_admin of clinic A lists memberships in clinic A", async () => {
    currentUser = {
      issuer: "https://auth0.example.com/",
      subject: "auth0|adminA",
      scopes: [],
      accessContext: {
        user: {
          id: adminUserId,
          issuer: "https://auth0.example.com/",
          subject: "auth0|adminA",
        },
        clinicMemberships: [
          {
            clinicId: clinicAId,
            userId: adminUserId,
            role: ClinicRole.Admin,
          },
        ],
      },
    };

    mockListMembershipsUseCase.execute.mockResolvedValue([sampleMembership]);

    const res = await request(app.getHttpServer()).get(
      `/clinics/${clinicAId}/memberships`,
    );
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].clinicId).toBe(clinicAId);
  });

  it("returns 201 when clinic_admin of clinic A assigns a user to clinic A", async () => {
    currentUser = {
      issuer: "https://auth0.example.com/",
      subject: "auth0|adminA",
      scopes: [],
      accessContext: {
        user: {
          id: adminUserId,
          issuer: "https://auth0.example.com/",
          subject: "auth0|adminA",
        },
        clinicMemberships: [
          {
            clinicId: clinicAId,
            userId: adminUserId,
            role: ClinicRole.Admin,
          },
        ],
      },
    };

    mockAssignMembershipUseCase.execute.mockResolvedValue(sampleMembership);

    const res = await request(app.getHttpServer())
      .post(`/clinics/${clinicAId}/memberships`)
      .send({
        userId: targetUserId,
        role: ClinicRole.User,
      });

    expect(res.status).toBe(201);
    expect(mockAssignMembershipUseCase.execute).toHaveBeenCalledWith(
      clinicAId,
      targetUserId,
      ClinicRole.User,
    );
  });

  it("pre-provisions a user and returns 201 when passing issuer and subject", async () => {
    currentUser = {
      issuer: "https://auth0.example.com/",
      subject: "auth0|adminA",
      scopes: [],
      accessContext: {
        user: {
          id: adminUserId,
          issuer: "https://auth0.example.com/",
          subject: "auth0|adminA",
        },
        clinicMemberships: [
          {
            clinicId: clinicAId,
            userId: adminUserId,
            role: ClinicRole.Admin,
          },
        ],
      },
    };

    mockAssignMembershipUseCase.execute.mockResolvedValue(sampleMembership);

    const res = await request(app.getHttpServer())
      .post(`/clinics/${clinicAId}/memberships`)
      .send({
        issuer: "https://auth0.example.com/",
        subject: "auth0|newemployee",
        role: ClinicRole.User,
      });

    expect(res.status).toBe(201);
    expect(mockAssignMembershipUseCase.execute).toHaveBeenCalledWith(
      clinicAId,
      {
        issuer: "https://auth0.example.com/",
        subject: "auth0|newemployee",
      },
      ClinicRole.User,
    );
  });

  it("returns 400 Bad Request when neither userId nor issuer/subject is provided", async () => {
    currentUser = {
      issuer: "https://auth0.example.com/",
      subject: "auth0|adminA",
      scopes: [],
      accessContext: {
        user: {
          id: adminUserId,
          issuer: "https://auth0.example.com/",
          subject: "auth0|adminA",
        },
        clinicMemberships: [
          {
            clinicId: clinicAId,
            userId: adminUserId,
            role: ClinicRole.Admin,
          },
        ],
      },
    };

    const res = await request(app.getHttpServer())
      .post(`/clinics/${clinicAId}/memberships`)
      .send({
        role: ClinicRole.User,
      });

    expect(res.status).toBe(400);
    expect(mockAssignMembershipUseCase.execute).not.toHaveBeenCalled();
  });

  it("returns 400 Bad Request when attempting to assign platform_admin or invalid role", async () => {
    currentUser = {
      issuer: "https://auth0.example.com/",
      subject: "auth0|adminA",
      scopes: [],
      accessContext: {
        user: {
          id: adminUserId,
          issuer: "https://auth0.example.com/",
          subject: "auth0|adminA",
        },
        clinicMemberships: [
          {
            clinicId: clinicAId,
            userId: adminUserId,
            role: ClinicRole.Admin,
          },
        ],
      },
    };

    const res = await request(app.getHttpServer())
      .post(`/clinics/${clinicAId}/memberships`)
      .send({
        userId: targetUserId,
        role: "platform_admin",
      });

    expect(res.status).toBe(400);
    expect(mockAssignMembershipUseCase.execute).not.toHaveBeenCalled();
  });

  it("returns 200 when clinic_admin updates role in their own clinic", async () => {
    currentUser = {
      issuer: "https://auth0.example.com/",
      subject: "auth0|adminA",
      scopes: [],
      accessContext: {
        user: {
          id: adminUserId,
          issuer: "https://auth0.example.com/",
          subject: "auth0|adminA",
        },
        clinicMemberships: [
          {
            clinicId: clinicAId,
            userId: adminUserId,
            role: ClinicRole.Admin,
          },
        ],
      },
    };

    const updated = { ...sampleMembership, role: ClinicRole.Admin };
    mockUpdateRoleUseCase.execute.mockResolvedValue(updated);

    const res = await request(app.getHttpServer())
      .put(`/clinics/${clinicAId}/memberships/${targetUserId}`)
      .send({ role: ClinicRole.Admin });

    expect(res.status).toBe(200);
    expect(mockUpdateRoleUseCase.execute).toHaveBeenCalledWith(
      clinicAId,
      targetUserId,
      ClinicRole.Admin,
    );
  });

  it("returns 204 when clinic_admin revokes membership in their own clinic", async () => {
    currentUser = {
      issuer: "https://auth0.example.com/",
      subject: "auth0|adminA",
      scopes: [],
      accessContext: {
        user: {
          id: adminUserId,
          issuer: "https://auth0.example.com/",
          subject: "auth0|adminA",
        },
        clinicMemberships: [
          {
            clinicId: clinicAId,
            userId: adminUserId,
            role: ClinicRole.Admin,
          },
        ],
      },
    };

    mockRevokeMembershipUseCase.execute.mockResolvedValue(true);

    const res = await request(app.getHttpServer()).delete(
      `/clinics/${clinicAId}/memberships/${targetUserId}`,
    );

    expect(res.status).toBe(204);
    expect(mockRevokeMembershipUseCase.execute).toHaveBeenCalledWith(
      clinicAId,
      targetUserId,
    );
  });

  it("platform_admin can manage memberships in any clinic", async () => {
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

    mockListMembershipsUseCase.execute.mockResolvedValue([sampleMembership]);

    const res = await request(app.getHttpServer()).get(
      `/clinics/${clinicBId}/memberships`,
    );
    expect(res.status).toBe(200);
    expect(mockListMembershipsUseCase.execute).toHaveBeenCalledWith(clinicBId);
  });
});

