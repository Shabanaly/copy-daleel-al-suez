import { IReviewRepository } from '../../repositories/review.repository'
import { Review } from '../../entities/review'

export class GetPlaceReviewsUseCase {
    constructor(private reviewRepository: IReviewRepository) { }

    async execute(placeId: string, userId?: string, client?: unknown): Promise<Review[]> {
        // userId is not used for fetching reviews anymore in the simplified flow,
        // but it might be used by the caller for something else (e.g. check current user review).
        return this.reviewRepository.getReviewsByPlace(placeId, client);
    }
}
