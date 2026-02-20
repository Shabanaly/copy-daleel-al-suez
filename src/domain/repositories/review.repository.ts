import { Review, ReviewStats, CreateReviewDTO } from '@/domain/entities/review'

export interface IReviewRepository {
    // Get reviews
    getReviewsByPlace(placeId: string, userId?: string, client?: unknown): Promise<Review[]>
    getReviewsByUser(userId: string, client?: unknown): Promise<Review[]>
    getReviewById(id: string, client?: unknown): Promise<Review | null>
    getUserReviewForPlace(userId: string, placeId: string, client?: unknown): Promise<Review | null>

    // Create/Update/Delete
    createReview(review: CreateReviewDTO & {
        userId: string,
        userName?: string,
        userAvatar?: string
    }, client?: unknown): Promise<Review>

    updateReview(id: string, data: Partial<CreateReviewDTO>, client?: unknown): Promise<Review>
    deleteReview(id: string, client?: unknown): Promise<void>

    // Stats
    getPlaceRatingStats(placeId: string, client?: unknown): Promise<ReviewStats>

    // Helpful votes
    voteReview(reviewId: string, userId: string, isHelpful: boolean, client?: unknown): Promise<void>
    removeVote(reviewId: string, userId: string, client?: unknown): Promise<void>
    getUserVote(reviewId: string, userId: string, client?: unknown): Promise<boolean | null>
}
