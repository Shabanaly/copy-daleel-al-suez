import { Article } from '../entities/article';
import { ArticleRepository } from '../interfaces/article-repository';

export class GetArticlesUseCase {
    constructor(private articleRepository: ArticleRepository) { }

    async execute(limit: number = 10, offset: number = 0, client?: unknown): Promise<Article[]> {
        return await this.articleRepository.getPublished(limit, offset, client);
    }
}
