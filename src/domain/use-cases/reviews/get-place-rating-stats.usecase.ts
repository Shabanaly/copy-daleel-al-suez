import { IReviewRepository } from '../../repositories/review.repository'
import { ReviewStats } from '../../entities/review'

export class GetPlaceRatingStatsUseCase {
    constructor(private reviewRepository: IReviewRepository) { }

    async execute(placeId: string, client?: unknown): Promise<ReviewStats> {
        return this.reviewRepository.getPlaceRatingStats(placeId, client); // note: repo doesn't accept client yet?
    }
}
