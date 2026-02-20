import { IUserRepository } from "../../interfaces/user-repository.interface";
import { User } from "../../entities/user";

export class GetCurrentUserUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(client?: unknown): Promise<User | null> {
        return this.userRepository.getCurrentUser(client);
    }
}
