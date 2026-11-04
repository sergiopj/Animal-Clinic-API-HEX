import { describe, expect, it } from "@jest/globals";
import {
  getAuthorizedClinicIds,
  isClinicAdmin,
  isClinicMember,
  isPlatformAdmin,
  UserAccessContext,
} from "../../../src/users/application/access-context";
import { ClinicRole } from "../../../src/users/domain/clinic-membership";
import { PlatformRole } from "../../../src/users/domain/user";

describe("access-context helper functions", () => {
  const platformAdminContext: UserAccessContext = {
    user: {
      id: "u-admin",
      issuer: "iss",
      subject: "sub",
      platformRole: PlatformRole.Admin,
    },
    clinicMemberships: [],
  };

  const clinicAdminContext: UserAccessContext = {
    user: { id: "u-cadmin", issuer: "iss", subject: "sub" },
    clinicMemberships: [
      { userId: "u-cadmin", clinicId: "clinic-A", role: ClinicRole.Admin },
      { userId: "u-cadmin", clinicId: "clinic-B", role: ClinicRole.User },
    ],
  };

  const clinicUserContext: UserAccessContext = {
    user: { id: "u-cuser", issuer: "iss", subject: "sub" },
    clinicMemberships: [
      { userId: "u-cuser", clinicId: "clinic-A", role: ClinicRole.User },
    ],
  };

  const emptyContext: UserAccessContext = {
    user: { id: "u-none", issuer: "iss", subject: "sub" },
    clinicMemberships: [],
  };

  describe("isPlatformAdmin", () => {
    it("returns true for platform admin", () => {
      expect(isPlatformAdmin(platformAdminContext)).toBe(true);
    });

    it("returns false for clinic admin and clinic user", () => {
      expect(isPlatformAdmin(clinicAdminContext)).toBe(false);
      expect(isPlatformAdmin(clinicUserContext)).toBe(false);
      expect(isPlatformAdmin(emptyContext)).toBe(false);
      expect(isPlatformAdmin(null)).toBe(false);
      expect(isPlatformAdmin(undefined)).toBe(false);
    });
  });

  describe("isClinicAdmin", () => {
    it("returns true for platform admin on ANY clinic", () => {
      expect(isClinicAdmin(platformAdminContext, "clinic-A")).toBe(true);
      expect(isClinicAdmin(platformAdminContext, "clinic-Z")).toBe(true);
    });

    it("returns true for clinic admin only on their admin clinics", () => {
      expect(isClinicAdmin(clinicAdminContext, "clinic-A")).toBe(true);
      expect(isClinicAdmin(clinicAdminContext, "clinic-B")).toBe(false);
      expect(isClinicAdmin(clinicAdminContext, "clinic-Z")).toBe(false);
    });

    it("returns false for clinic user", () => {
      expect(isClinicAdmin(clinicUserContext, "clinic-A")).toBe(false);
    });
  });

  describe("isClinicMember", () => {
    it("returns true for platform admin on ANY clinic", () => {
      expect(isClinicMember(platformAdminContext, "clinic-A")).toBe(true);
      expect(isClinicMember(platformAdminContext, "clinic-Z")).toBe(true);
    });

    it("returns true for clinic member only on their clinics", () => {
      expect(isClinicMember(clinicAdminContext, "clinic-A")).toBe(true);
      expect(isClinicMember(clinicAdminContext, "clinic-B")).toBe(true);
      expect(isClinicMember(clinicAdminContext, "clinic-Z")).toBe(false);

      expect(isClinicMember(clinicUserContext, "clinic-A")).toBe(true);
      expect(isClinicMember(clinicUserContext, "clinic-B")).toBe(false);
    });
  });

  describe("getAuthorizedClinicIds", () => {
    it("returns array of clinic IDs for user", () => {
      expect(getAuthorizedClinicIds(clinicAdminContext)).toEqual([
        "clinic-A",
        "clinic-B",
      ]);
      expect(getAuthorizedClinicIds(clinicUserContext)).toEqual(["clinic-A"]);
      expect(getAuthorizedClinicIds(emptyContext)).toEqual([]);
      expect(getAuthorizedClinicIds(null)).toEqual([]);
    });
  });
});

