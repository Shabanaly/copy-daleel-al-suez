import { IReviewRepository } from '@/domain/repositories/review.repository'
import { Review } from '@/domain/entities/review'

export class GetUserReviewsUseCase {
    constructor(private reviewRepository: IReviewRepository) { }

    async execute(userId: string): Promise<Review[]> {
        return this.reviewRepository.getReviewsByUser(userId)
    }
}
