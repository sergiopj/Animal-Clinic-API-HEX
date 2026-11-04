import { User } from "../../domain/user";
import { ListUsersPort } from "../ports/in/list-users.port";
import { UserRepositoryPort } from "../ports/out/user-repository.port";

export class ListUsersUseCase implements ListUsersPort {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  execute(): Promise<User[]> {
    return this.userRepository.findAllUsers();
  }
}

