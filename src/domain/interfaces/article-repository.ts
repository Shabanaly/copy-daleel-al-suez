import { Article, CreateArticleDTO, UpdateArticleDTO } from '../entities/article';

export interface ArticleRepository {
    create(article: CreateArticleDTO, client?: unknown): Promise<Article>;
    update(article: UpdateArticleDTO, client?: unknown): Promise<Article>;
    delete(id: string, client?: unknown): Promise<void>;
    getById(id: string, client?: unknown): Promise<Article | null>;
    getAll(limit?: number, offset?: number, client?: unknown): Promise<Article[]>;
    getPublished(limit?: number, offset?: number, client?: unknown): Promise<Article[]>;
    getLatest(limit: number): Promise<Article[]>;
}
