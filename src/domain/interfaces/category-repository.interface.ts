import { Category } from "../entities/category";

export interface ICategoryRepository {
    getAllCategories(options?: { orderBy?: 'name' | 'created_at', limit?: number, offset?: number, includeInactive?: boolean }, client?: unknown): Promise<Category[]>;
    getCategoryBySlug(slug: string, client?: unknown): Promise<Category | null>;

}
