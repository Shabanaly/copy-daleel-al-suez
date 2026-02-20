import { IUserRepository } from "../../interfaces/user-repository.interface";

export class GetUserRoleUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(userId: string, client?: unknown): Promise<string> {
        return this.userRepository.getUserRole(userId, client);
    }
}
