import { IReviewRepository } from '../../repositories/review.repository'
import { Review, CreateReviewDTO } from '../../entities/review'

export class CreateReviewUseCase {
    constructor(private reviewRepository: IReviewRepository) { }

    async execute(data: CreateReviewDTO & {
        userId: string,
        userName?: string,
        userAvatar?: string
    }): Promise<Review> {
        // Validation
        if (data.rating < 1 || data.rating > 5) {
            throw new Error('Rating must be between 1 and 5')
        }

        if (!data.comment || data.comment.trim().length < 5) {
            throw new Error('Comment must be at least 5 characters')
        }

        return await this.reviewRepository.createReview(data)
    }
}
