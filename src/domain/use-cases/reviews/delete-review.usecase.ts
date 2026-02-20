import { IReviewRepository } from '../../repositories/review.repository'

export class DeleteReviewUseCase {
    constructor(private reviewRepository: IReviewRepository) { }

    async execute(reviewId: string): Promise<void> {
        await this.reviewRepository.deleteReview(reviewId)
    }
}
