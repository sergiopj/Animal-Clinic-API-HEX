import { describe, expect, it, jest } from "@jest/globals";

jest.mock("jwks-rsa", () => ({
  __esModule: true,
  default: {
    passportJwtSecret: jest.fn(() => () => "test-secret"),
  },
  passportJwtSecret: jest.fn(() => () => "test-secret"),
}));

import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Auth0JwtStrategy } from "../../src/auth/strategies/auth0-jwt.strategy";
import { ResolveUserAccessContextPort } from "../../src/users/application/ports/in/resolve-user-access-context.port";
import { ClinicRole } from "../../src/users/domain/clinic-membership";
import { PlatformRole } from "../../src/users/domain/user";

describe("Auth0JwtStrategy", () => {
  const mockConfig = {
    getOrThrow: jest.fn((key: string) => {
      if (key === "AUTH0_ISSUER_URL") return "https://test.auth0.com/";
      if (key === "AUTH0_AUDIENCE") return "https://api.animal-clinic";
      throw new Error(`Unknown key ${key}`);
    }),
  } as unknown as ConfigService;

  const mockResolveAccessContext: jest.Mocked<ResolveUserAccessContextPort> = {
    execute: jest.fn(),
  };

  const strategy = new Auth0JwtStrategy(
    mockConfig,
    mockResolveAccessContext,
  );

  it("throws UnauthorizedException when payload lacks sub or iss", async () => {
    await expect(strategy.validate(null)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(
      strategy.validate({ sub: "auth0|123" }),
    ).rejects.toThrow(UnauthorizedException);
    await expect(
      strategy.validate({ iss: "https://test.auth0.com/" }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("resolves user access context and returns AuthenticatedUser", async () => {
    const payload = {
      sub: "auth0|123",
      iss: "https://test.auth0.com/",
      scope: "read:pets write:pets",
    };

    const mockContext = {
      user: {
        id: "u-1",
        issuer: "https://test.auth0.com/",
        subject: "auth0|123",
        platformRole: PlatformRole.Admin,
      },
      clinicMemberships: [
        { userId: "u-1", clinicId: "c-1", role: ClinicRole.Admin },
      ],
    };

    (mockResolveAccessContext.execute as jest.Mock<any>).mockResolvedValue(
      mockContext,
    );

    const result = await strategy.validate(payload);

    expect(result).toEqual({
      subject: "auth0|123",
      issuer: "https://test.auth0.com/",
      scopes: ["read:pets", "write:pets"],
      accessContext: mockContext,
    });
    expect(mockResolveAccessContext.execute).toHaveBeenCalledWith({
      issuer: "https://test.auth0.com/",
      subject: "auth0|123",
    });
  });

  it("returns accessContext as null for unprovisioned users", async () => {
    const payload = {
      sub: "auth0|unprovisioned",
      iss: "https://test.auth0.com/",
    };

    (mockResolveAccessContext.execute as jest.Mock<any>).mockResolvedValue(null);

    const result = await strategy.validate(payload);

    expect(result.accessContext).toBeNull();
    expect(result.subject).toBe("auth0|unprovisioned");
  });
});
