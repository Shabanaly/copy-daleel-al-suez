import { SupabaseReviewRepository } from "@/data/repositories/supabase-review.repository";
import { GetPlaceReviewsUseCase } from "@/domain/use-cases/reviews/get-place-reviews.usecase";
import { GetPlaceRatingStatsUseCase } from "@/domain/use-cases/reviews/get-place-rating-stats.usecase";
import { CreateReviewUseCase } from "@/domain/use-cases/reviews/create-review.usecase";
import { UpdateReviewUseCase } from "@/domain/use-cases/reviews/update-review.usecase";
import { DeleteReviewUseCase } from "@/domain/use-cases/reviews/delete-review.usecase";
import { VoteReviewUseCase } from "@/domain/use-cases/reviews/vote-review.usecase";

// 1. Repository
export const reviewRepository = new SupabaseReviewRepository();

// 2. Use Cases
export const getPlaceReviewsUseCase = new GetPlaceReviewsUseCase(reviewRepository);
export const getPlaceRatingStatsUseCase = new GetPlaceRatingStatsUseCase(reviewRepository);
export const createReviewUseCase = new CreateReviewUseCase(reviewRepository);
export const updateReviewUseCase = new UpdateReviewUseCase(reviewRepository);
export const deleteReviewUseCase = new DeleteReviewUseCase(reviewRepository);
export const voteReviewUseCase = new VoteReviewUseCase(reviewRepository);
