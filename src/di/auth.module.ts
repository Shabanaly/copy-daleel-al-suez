import { SupabaseUserRepository } from "@/data/repositories/supabase-user.repository";
import { GetCurrentUserUseCase } from "@/domain/use-cases/auth/get-current-user.usecase";
import { GetUserRoleUseCase } from "@/domain/use-cases/auth/get-user-role.usecase";

// 1. Repository
export const userRepository = new SupabaseUserRepository();

// 2. Use Cases
export const getCurrentUserUseCase = new GetCurrentUserUseCase(userRepository);
export const getUserRoleUseCase = new GetUserRoleUseCase(userRepository);
