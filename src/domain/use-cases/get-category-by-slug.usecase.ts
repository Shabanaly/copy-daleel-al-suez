import { Category } from "../entities/category";
import { ICategoryRepository } from "../interfaces/category-repository.interface";

export class GetCategoryBySlugUseCase {
    constructor(private categoryRepository: ICategoryRepository) { }

    async execute(slug: string, client?: unknown): Promise<Category | null> {
        return this.categoryRepository.getCategoryBySlug(slug, client);
    }
}
