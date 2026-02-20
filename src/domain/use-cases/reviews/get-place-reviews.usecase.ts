import { IReviewRepository } from '../../repositories/review.repository'
import { Review } from '../../entities/review'

export class GetPlaceReviewsUseCase {
    constructor(private reviewRepository: IReviewRepository) { }

    async execute(placeId: string, userId?: string, client?: unknown): Promise<Review[]> {
        return this.reviewRepository.getReviewsByPlace(placeId, userId); // note: repo doesn't accept client yet? check repo.
    }
}
