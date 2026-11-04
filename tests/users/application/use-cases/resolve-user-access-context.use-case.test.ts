import { describe, expect, it, jest } from "@jest/globals";
import { UserAccessContext } from "../../../../src/users/application/access-context";
import { UserRepositoryPort } from "../../../../src/users/application/ports/out/user-repository.port";
import { ResolveUserAccessContextUseCase } from "../../../../src/users/application/use-cases/resolve-user-access-context.use-case";
import { ClinicRole } from "../../../../src/users/domain/clinic-membership";
import { PlatformRole } from "../../../../src/users/domain/user";

describe("ResolveUserAccessContextUseCase", () => {
  const mockUserRepository = {
    findAccessContextByIdentity: jest.fn<any>(),
  } as unknown as UserRepositoryPort;

  const useCase = new ResolveUserAccessContextUseCase(mockUserRepository);

  it("returns access context when user is found", async () => {
    const mockContext: UserAccessContext = {
      user: {
        id: "user-1",
        issuer: "https://auth.example.com/",
        subject: "auth0|123",
        platformRole: PlatformRole.Admin,
      },
      clinicMemberships: [
        {
          userId: "user-1",
          clinicId: "clinic-1",
          role: ClinicRole.Admin,
        },
      ],
    };

    (
      mockUserRepository.findAccessContextByIdentity as jest.Mock<any>
    ).mockResolvedValue(mockContext);

    const result = await useCase.execute({
      issuer: "https://auth.example.com/",
      subject: "auth0|123",
    });

    expect(result).toEqual(mockContext);
    expect(mockUserRepository.findAccessContextByIdentity).toHaveBeenCalledWith({
      issuer: "https://auth.example.com/",
      subject: "auth0|123",
    });
  });

  it("returns null when user is not found in local database", async () => {
    (
      mockUserRepository.findAccessContextByIdentity as jest.Mock<any>
    ).mockResolvedValue(null);

    const result = await useCase.execute({
      issuer: "https://auth.example.com/",
      subject: "unknown-sub",
    });

    expect(result).toBeNull();
  });
});
