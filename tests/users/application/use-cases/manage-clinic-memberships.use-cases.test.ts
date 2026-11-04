import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { UserRepositoryPort } from "../../../../src/users/application/ports/out/user-repository.port";
import { AssignClinicMembershipUseCase } from "../../../../src/users/application/use-cases/assign-clinic-membership.use-case";
import { ListClinicMembershipsUseCase } from "../../../../src/users/application/use-cases/list-clinic-memberships.use-case";
import { RevokeClinicMembershipUseCase } from "../../../../src/users/application/use-cases/revoke-clinic-membership.use-case";
import { UpdateClinicMembershipRoleUseCase } from "../../../../src/users/application/use-cases/update-clinic-membership-role.use-case";
import { ClinicRole } from "../../../../src/users/domain/clinic-membership";

describe("Clinic Memberships Use Cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRepo = {
    findById: jest.fn<any>(),
    findByIdentity: jest.fn<any>(),
    createUser: jest.fn<any>(),
    findMembership: jest.fn<any>(),
    addMembership: jest.fn<any>(),
    updateMembershipRole: jest.fn<any>(),
    removeMembership: jest.fn<any>(),
    findMembershipsByClinic: jest.fn<any>(),
  } as unknown as UserRepositoryPort;

  describe("AssignClinicMembershipUseCase", () => {
    const useCase = new AssignClinicMembershipUseCase(mockRepo);

    it("assigns membership when user exists and has no prior membership", async () => {
      (mockRepo.findById as jest.Mock<any>).mockResolvedValue({
        id: "u-1",
        issuer: "iss",
        subject: "sub",
      });
      (mockRepo.findMembership as jest.Mock<any>).mockResolvedValue(null);
      (mockRepo.addMembership as jest.Mock<any>).mockResolvedValue({
        userId: "u-1",
        clinicId: "c-1",
        role: ClinicRole.User,
      });

      const result = await useCase.execute("c-1", "u-1", ClinicRole.User);
      expect(result).toEqual({
        userId: "u-1",
        clinicId: "c-1",
        role: ClinicRole.User,
      });
      expect(mockRepo.addMembership).toHaveBeenCalledWith({
        clinicId: "c-1",
        userId: "u-1",
        role: ClinicRole.User,
      });
    });

    it("throws NotFoundException when user does not exist", async () => {
      (mockRepo.findById as jest.Mock<any>).mockResolvedValue(null);

      await expect(
        useCase.execute("c-1", "non-existent-user", ClinicRole.User),
      ).rejects.toThrow(NotFoundException);
    });

    it("throws ConflictException when user already has a membership in clinic", async () => {
      (mockRepo.findById as jest.Mock<any>).mockResolvedValue({
        id: "u-1",
        issuer: "iss",
        subject: "sub",
      });
      (mockRepo.findMembership as jest.Mock<any>).mockResolvedValue({
        userId: "u-1",
        clinicId: "c-1",
        role: ClinicRole.User,
      });

      await expect(
        useCase.execute("c-1", "u-1", ClinicRole.Admin),
      ).rejects.toThrow(ConflictException);
    });

    it("pre-provisions a new local user with zero global roles and assigns membership when user does not exist yet", async () => {
      (mockRepo.findByIdentity as jest.Mock<any>).mockResolvedValue(null);
      (mockRepo.createUser as jest.Mock<any>).mockResolvedValue({
        id: "u-new",
        issuer: "https://auth0.example.com/",
        subject: "auth0|new-user",
        // zero global roles
      });
      (mockRepo.findMembership as jest.Mock<any>).mockResolvedValue(null);
      (mockRepo.addMembership as jest.Mock<any>).mockResolvedValue({
        userId: "u-new",
        clinicId: "c-1",
        role: ClinicRole.User,
      });

      const result = await useCase.execute(
        "c-1",
        {
          issuer: "https://auth0.example.com/",
          subject: "auth0|new-user",
        },
        ClinicRole.User,
      );

      expect(mockRepo.createUser).toHaveBeenCalledWith({
        issuer: "https://auth0.example.com/",
        subject: "auth0|new-user",
      });
      expect(mockRepo.addMembership).toHaveBeenCalledWith({
        clinicId: "c-1",
        userId: "u-new",
        role: ClinicRole.User,
      });
      expect(result).toEqual({
        userId: "u-new",
        clinicId: "c-1",
        role: ClinicRole.User,
      });
    });

    it("pre-provisions by identity using existing user when already in database", async () => {
      (mockRepo.findByIdentity as jest.Mock<any>).mockResolvedValue({
        id: "u-existing",
        issuer: "https://auth0.example.com/",
        subject: "auth0|existing",
      });
      (mockRepo.findMembership as jest.Mock<any>).mockResolvedValue(null);
      (mockRepo.addMembership as jest.Mock<any>).mockResolvedValue({
        userId: "u-existing",
        clinicId: "c-1",
        role: ClinicRole.Admin,
      });

      const result = await useCase.execute({
        clinicId: "c-1",
        issuer: "https://auth0.example.com/",
        subject: "auth0|existing",
        role: ClinicRole.Admin,
      });

      expect(mockRepo.createUser).not.toHaveBeenCalled();
      expect(mockRepo.addMembership).toHaveBeenCalledWith({
        clinicId: "c-1",
        userId: "u-existing",
        role: ClinicRole.Admin,
      });
      expect(result).toEqual({
        userId: "u-existing",
        clinicId: "c-1",
        role: ClinicRole.Admin,
      });
    });

    it("throws BadRequestException when neither userId nor issuer/subject is provided", async () => {
      await expect(
        useCase.execute({
          clinicId: "c-1",
          role: ClinicRole.User,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("UpdateClinicMembershipRoleUseCase", () => {
    const useCase = new UpdateClinicMembershipRoleUseCase(mockRepo);

    it("updates role when membership exists", async () => {
      (mockRepo.updateMembershipRole as jest.Mock<any>).mockResolvedValue({
        userId: "u-1",
        clinicId: "c-1",
        role: ClinicRole.Admin,
      });

      const result = await useCase.execute("c-1", "u-1", ClinicRole.Admin);
      expect(result?.role).toBe(ClinicRole.Admin);
    });

    it("returns null when membership is not found", async () => {
      (mockRepo.updateMembershipRole as jest.Mock<any>).mockResolvedValue(null);
      const result = await useCase.execute("c-1", "u-999", ClinicRole.Admin);
      expect(result).toBeNull();
    });
  });

  describe("RevokeClinicMembershipUseCase", () => {
    const useCase = new RevokeClinicMembershipUseCase(mockRepo);

    it("returns true when membership is removed", async () => {
      (mockRepo.removeMembership as jest.Mock<any>).mockResolvedValue(true);
      const result = await useCase.execute("c-1", "u-1");
      expect(result).toBe(true);
    });

    it("returns false when membership is not found", async () => {
      (mockRepo.removeMembership as jest.Mock<any>).mockResolvedValue(false);
      const result = await useCase.execute("c-1", "u-999");
      expect(result).toBe(false);
    });
  });

  describe("ListClinicMembershipsUseCase", () => {
    const useCase = new ListClinicMembershipsUseCase(mockRepo);

    it("returns memberships for the clinic", async () => {
      const memberships = [
        { userId: "u-1", clinicId: "c-1", role: ClinicRole.Admin },
        { userId: "u-2", clinicId: "c-1", role: ClinicRole.User },
      ];
      (mockRepo.findMembershipsByClinic as jest.Mock<any>).mockResolvedValue(
        memberships,
      );

      const result = await useCase.execute("c-1");
      expect(result).toEqual(memberships);
      expect(mockRepo.findMembershipsByClinic).toHaveBeenCalledWith("c-1");
    });
  });
});
