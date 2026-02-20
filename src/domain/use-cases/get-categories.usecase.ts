import { Category } from "../entities/category";
import { ICategoryRepository } from "../interfaces/category-repository.interface";

export class GetCategoriesUseCase {
    constructor(private categoryRepository: ICategoryRepository) { }

    async execute(options?: { orderBy?: 'name' | 'created_at', limit?: number, offset?: number }, client?: unknown): Promise<Category[]> {
        return this.categoryRepository.getAllCategories(options, client);
    }
}
