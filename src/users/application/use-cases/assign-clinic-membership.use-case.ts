import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import {
  ClinicMembership,
  ClinicRole,
} from "../../domain/clinic-membership";
import { User } from "../../domain/user";
import {
  AssignClinicMembershipCommand,
  AssignClinicMembershipPort,
} from "../ports/in/assign-clinic-membership.port";
import { UserRepositoryPort } from "../ports/out/user-repository.port";

export class AssignClinicMembershipUseCase
  implements AssignClinicMembershipPort
{
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(
    command: AssignClinicMembershipCommand,
  ): Promise<ClinicMembership>;
  async execute(
    clinicId: string,
    userIdOrIdentity: string | { issuer: string; subject: string },
    role: ClinicRole,
  ): Promise<ClinicMembership>;
  async execute(
    clinicIdOrCommand: string | AssignClinicMembershipCommand,
    userIdOrIdentity?: string | { issuer: string; subject: string },
    roleParam?: ClinicRole,
  ): Promise<ClinicMembership> {
    let clinicId: string;
    let role: ClinicRole;
    let userId: string | undefined;
    let issuer: string | undefined;
    let subject: string | undefined;

    if (typeof clinicIdOrCommand === "object") {
      clinicId = clinicIdOrCommand.clinicId;
      role = clinicIdOrCommand.role;
      userId = clinicIdOrCommand.userId;
      issuer = clinicIdOrCommand.issuer;
      subject = clinicIdOrCommand.subject;
    } else {
      clinicId = clinicIdOrCommand;
      role = roleParam!;
      if (typeof userIdOrIdentity === "string") {
        userId = userIdOrIdentity;
      } else if (userIdOrIdentity && typeof userIdOrIdentity === "object") {
        issuer = userIdOrIdentity.issuer;
        subject = userIdOrIdentity.subject;
      }
    }

    let user: User | null = null;

    if (userId) {
      user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }
    } else if (issuer && subject) {
      user = await this.userRepository.findByIdentity({ issuer, subject });
      if (!user) {
        // Pre-provision local user with zero global roles
        user = await this.userRepository.createUser({
          issuer,
          subject,
        });
      }
    } else {
      throw new BadRequestException(
        "Either userId or both issuer and subject must be provided",
      );
    }

    const existing = await this.userRepository.findMembership(clinicId, user.id);
    if (existing) {
      throw new ConflictException(
        `User ${user.id} already has a membership in clinic ${clinicId}`,
      );
    }

    return this.userRepository.addMembership({ clinicId, userId: user.id, role });
  }
}
