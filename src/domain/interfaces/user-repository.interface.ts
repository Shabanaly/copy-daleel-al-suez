import { User } from "../entities/user";

export interface UserStats {
    placesCount: number;
    reviewsCount: number;
}

export interface IUserRepository {
    getCurrentUser(client?: unknown): Promise<User | null>;
    getUserRole(userId: string, client?: unknown): Promise<string>;
    getUserStats(userId: string, client?: unknown): Promise<UserStats>;
}
// Note: client is kept as any for now to avoid dependency cycles in domain, 
// but we will use specific types in implementations and suppress any only where necessary.
