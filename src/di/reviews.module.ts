import { SupabaseReviewRepository } from "@/data/repositories/supabase-review.repository";
import { GetPlaceReviewsUseCase } from "@/domain/use-cases/reviews/get-place-reviews.usecase";
import { GetPlaceRatingStatsUseCase } from "@/domain/use-cases/reviews/get-place-rating-stats.usecase";

// 1. Repository
export const reviewRepository = new SupabaseReviewRepository();

// 2. Use Cases
export const getPlaceReviewsUseCase = new GetPlaceReviewsUseCase(reviewRepository);
export const getPlaceRatingStatsUseCase = new GetPlaceRatingStatsUseCase(reviewRepository);
