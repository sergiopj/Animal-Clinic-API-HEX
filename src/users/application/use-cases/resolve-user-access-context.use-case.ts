import { ExternalIdentity, UserAccessContext } from "../access-context";
import { ResolveUserAccessContextPort } from "../ports/in/resolve-user-access-context.port";
import { UserRepositoryPort } from "../ports/out/user-repository.port";

export class ResolveUserAccessContextUseCase implements ResolveUserAccessContextPort {
    constructor(private readonly userRepository: UserRepositoryPort) { }

    execute(identity: ExternalIdentity): Promise<UserAccessContext | null> {
        return this.userRepository.findAccessContextByIdentity(identity);
    }

}
