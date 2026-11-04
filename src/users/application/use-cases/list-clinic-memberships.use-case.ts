import { ClinicMembership } from "../../domain/clinic-membership";
import { ListClinicMembershipsPort } from "../ports/in/list-clinic-memberships.port";
import { UserRepositoryPort } from "../ports/out/user-repository.port";

export class ListClinicMembershipsUseCase
  implements ListClinicMembershipsPort
{
  constructor(private readonly userRepository: UserRepositoryPort) {}

  execute(clinicId: string): Promise<ClinicMembership[]> {
    return this.userRepository.findMembershipsByClinic(clinicId);
  }
}

