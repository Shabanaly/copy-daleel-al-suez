import { Article } from '../entities/article';
import { ArticleRepository } from '../interfaces/article-repository';

export class GetArticleByIdUseCase {
    constructor(private articleRepository: ArticleRepository) { }

    async execute(id: string, client?: unknown): Promise<Article | null> {
        return await this.articleRepository.getById(id, client);
    }
}
