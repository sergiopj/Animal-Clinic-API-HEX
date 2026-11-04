import { RevokeClinicMembershipPort } from "../ports/in/revoke-clinic-membership.port";
import { UserRepositoryPort } from "../ports/out/user-repository.port";

export class RevokeClinicMembershipUseCase
  implements RevokeClinicMembershipPort
{
  constructor(private readonly userRepository: UserRepositoryPort) {}

  execute(clinicId: string, userId: string): Promise<boolean> {
    return this.userRepository.removeMembership(clinicId, userId);
  }
}

