import { SupabasePlaceRepository } from "@/data/repositories/supabase-place.repository";
import { GetFeaturedPlacesUseCase } from "@/domain/use-cases/get-featured-places.usecase";
import { SupabaseCategoryRepository } from "@/data/repositories/supabase-category.repository";
import { GetCategoriesUseCase } from "@/domain/use-cases/get-categories.usecase";
import { GetPlacesByCategoryUseCase } from "@/domain/use-cases/get-places-by-category.usecase";
import { GetPlaceBySlugUseCase } from "@/domain/use-cases/get-place-by-slug.usecase";
import { SearchPlacesUseCase } from "@/domain/use-cases/search-places.usecase";

import { CreatePlaceUseCase } from "@/domain/use-cases/create-place.usecase";
import { UpdatePlaceUseCase } from "@/domain/use-cases/update-place.usecase";
import { GetPlaceByIdUseCase } from "@/domain/use-cases/get-place-by-id.usecase";
import { SupabaseSettingsRepository } from "@/data/repositories/supabase-settings.repository";

// Reviews
import { SupabaseReviewRepository } from "@/data/repositories/supabase-review.repository";
import { GetPlaceReviewsUseCase } from "@/domain/use-cases/reviews/get-place-reviews.usecase";
import { GetPlaceRatingStatsUseCase } from "@/domain/use-cases/reviews/get-place-rating-stats.usecase";
import { CreateReviewUseCase } from "@/domain/use-cases/reviews/create-review.usecase";
import { UpdateReviewUseCase } from "@/domain/use-cases/reviews/update-review.usecase";
import { DeleteReviewUseCase } from "@/domain/use-cases/reviews/delete-review.usecase";
import { VoteReviewUseCase } from "@/domain/use-cases/reviews/vote-review.usecase";

// Events
import { SupabaseEventRepository } from "@/data/repositories/supabase-event.repository";
import { GetActiveEventsUseCase } from "@/domain/use-cases/get-active-events.usecase";
import { GetEventByIdUseCase } from "@/domain/use-cases/get-event-by-id.usecase";

// Articles
import { SupabaseArticleRepository } from "@/data/repositories/supabase-article-repository";
import { GetArticlesUseCase } from "@/domain/use-cases/get-articles.usecase";
import { GetArticleByIdUseCase } from "@/domain/use-cases/get-article-by-id.usecase";
import { GetLatestArticlesUseCase } from "@/domain/use-cases/get-latest-articles.usecase";
import { SupabaseImportedPlaceRepository } from "@/data/repositories/supabase-imported-place.repository";
// Google Places
import { SerperGoogleMapsService } from "@/data/services/serper-google-maps.service";

// 1. Repositories
const placeRepository = new SupabasePlaceRepository();
const categoryRepository = new SupabaseCategoryRepository();
const settingsRepository = new SupabaseSettingsRepository();
const reviewRepository = new SupabaseReviewRepository();
const eventRepository = new SupabaseEventRepository();
const articleRepository = new SupabaseArticleRepository();
const importedPlaceRepository = new SupabaseImportedPlaceRepository();

// 2. Use Cases
export const getFeaturedPlacesUseCase = new GetFeaturedPlacesUseCase(placeRepository);
export const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);

export const getPlacesByCategoryUseCase = new GetPlacesByCategoryUseCase(placeRepository);
export const getPlaceBySlugUseCase = new GetPlaceBySlugUseCase(placeRepository);
export const searchPlacesUseCase = new SearchPlacesUseCase(placeRepository);

// Admin Use Cases
// export const getAdminPlacesUseCase = new GetAdminPlacesUseCase(placeRepository);
export const createPlaceUseCase = new CreatePlaceUseCase(placeRepository);
export const updatePlaceUseCase = new UpdatePlaceUseCase(placeRepository);
// export const deletePlaceUseCase = new DeletePlaceUseCase(placeRepository);
export const getPlaceByIdUseCase = new GetPlaceByIdUseCase(placeRepository);

// Settings Use Cases disabled for now
// export const getSettingsUseCase = new GetSettingsUseCase(settingsRepository);
// export const updateSettingUseCase = new UpdateSettingUseCase(settingsRepository);

// Reviews Use Cases
export const getPlaceReviewsUseCase = new GetPlaceReviewsUseCase(reviewRepository);
export const getPlaceRatingStatsUseCase = new GetPlaceRatingStatsUseCase(reviewRepository);
export const createReviewUseCase = new CreateReviewUseCase(reviewRepository);
export const updateReviewUseCase = new UpdateReviewUseCase(reviewRepository);
export const deleteReviewUseCase = new DeleteReviewUseCase(reviewRepository);
export const voteReviewUseCase = new VoteReviewUseCase(reviewRepository);

// Events Use Cases
// export const getAdminEventsUseCase = new GetAdminEventsUseCase(eventRepository);
// export const createEventUseCase = new CreateEventUseCase(eventRepository);
// export const updateEventUseCase = new UpdateEventUseCase(eventRepository);
// export const deleteEventUseCase = new DeleteEventUseCase(eventRepository);
export const getActiveEventsUseCase = new GetActiveEventsUseCase(eventRepository);
export const getEventByIdUseCase = new GetEventByIdUseCase(eventRepository);

// Article Use Cases
export const getArticlesUseCase = new GetArticlesUseCase(articleRepository);
export const getArticleByIdUseCase = new GetArticleByIdUseCase(articleRepository);
export const getLatestArticlesUseCase = new GetLatestArticlesUseCase(articleRepository);
// export const getAdminArticlesUseCase = new GetAdminArticlesUseCase(articleRepository);
// export const createArticleUseCase = new CreateArticleUseCase(articleRepository);
// export const updateArticleUseCase = new UpdateArticleUseCase(articleRepository);
// export const deleteArticleUseCase = new DeleteArticleUseCase(articleRepository);

// Area Use Cases
import { SupabaseAreaRepository } from "@/data/repositories/supabase-area.repository";
import { GetAreasUseCase } from "@/domain/use-cases/get-areas.usecase";

const areaRepository = new SupabaseAreaRepository();
export const getAreasUseCase = new GetAreasUseCase(areaRepository);

// User/Auth Use Cases
import { SupabaseUserRepository } from "@/data/repositories/supabase-user.repository";
import { GetCurrentUserUseCase } from "@/domain/use-cases/auth/get-current-user.usecase";
import { GetUserRoleUseCase } from "../domain/use-cases/auth/get-user-role.usecase";

const userRepository = new SupabaseUserRepository();
export const getCurrentUserUseCase = new GetCurrentUserUseCase(userRepository);
export const getUserRoleUseCase = new GetUserRoleUseCase(userRepository);

// export const getUsersUseCase = new GetUsersUseCase(userRepository);
// export const getUserStatsUseCase = new GetUserStatsUseCase(userRepository);
// export const getUserLogsUseCase = new GetUserLogsUseCase(userRepository);

// import { UpdateUserRoleUseCase } from "@/domain/use-cases/admin/update-user-role.usecase";
// export const updateUserRoleUseCase = new UpdateUserRoleUseCase(userRepository);

// Google Places Cases removed for redesign
// export const googlePlacesService = new SerperGoogleMapsService(process.env.SERPER_API_KEY || '');
// export const searchGooglePlacesUseCase = new SearchGooglePlacesUseCase(googlePlacesService);
// export const importGooglePlaceUseCase = new ImportGooglePlaceUseCase(googlePlacesService, placeRepository, importedPlaceRepository);
// export const getSuggestedPlacesUseCase = new GetSuggestedPlacesUseCase(importedPlaceRepository);
// export const processSuggestedPlaceUseCase = new ProcessSuggestedPlaceUseCase(importedPlaceRepository, placeRepository);
