import { IReviewRepository } from '../../repositories/review.repository'

export class VoteReviewUseCase {
    constructor(private reviewRepository: IReviewRepository) { }

    async execute(reviewId: string, userId: string, isHelpful: boolean): Promise<void> {
        await this.reviewRepository.voteReview(reviewId, userId, isHelpful)
    }
}
