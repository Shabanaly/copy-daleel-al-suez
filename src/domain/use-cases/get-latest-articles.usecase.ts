import { Article } from '../entities/article';
import { ArticleRepository } from '../interfaces/article-repository';

export class GetLatestArticlesUseCase {
    constructor(private articleRepository: ArticleRepository) { }

    async execute(limit: number = 3, client?: unknown): Promise<Article[]> {
        return await this.articleRepository.getPublished(limit, 0, client);
    }
}
