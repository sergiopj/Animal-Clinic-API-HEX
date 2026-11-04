import { ExternalIdentity, UserAccessContext } from "../../access-context";
import {
  ClinicMembership,
  ClinicRole,
} from "../../../domain/clinic-membership";
import { User } from "../../../domain/user";

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

export interface UserRepositoryPort {
  findAccessContextByIdentity(
    identity: ExternalIdentity,
  ): Promise<UserAccessContext | null>;
  findById(id: string): Promise<User | null>;
  findByIdentity(identity: ExternalIdentity): Promise<User | null>;
  createUser(user: Omit<User, "id">): Promise<User>;
  findAllUsers(): Promise<User[]>;
  findMembership(
    clinicId: string,
    userId: string,
  ): Promise<ClinicMembership | null>;
  findMembershipsByClinic(clinicId: string): Promise<ClinicMembership[]>;
  addMembership(membership: ClinicMembership): Promise<ClinicMembership>;
  updateMembershipRole(
    clinicId: string,
    userId: string,
    role: ClinicRole,
  ): Promise<ClinicMembership | null>;
  removeMembership(clinicId: string, userId: string): Promise<boolean>;
}
