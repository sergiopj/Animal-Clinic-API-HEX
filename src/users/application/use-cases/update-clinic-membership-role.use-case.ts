import {
  ClinicMembership,
  ClinicRole,
} from "../../domain/clinic-membership";
import { UpdateClinicMembershipRolePort } from "../ports/in/update-clinic-membership-role.port";
import { UserRepositoryPort } from "../ports/out/user-repository.port";

export class UpdateClinicMembershipRoleUseCase
  implements UpdateClinicMembershipRolePort
{
  constructor(private readonly userRepository: UserRepositoryPort) {}

  execute(
    clinicId: string,
    userId: string,
    role: ClinicRole,
  ): Promise<ClinicMembership | null> {
    return this.userRepository.updateMembershipRole(clinicId, userId, role);
  }
}

