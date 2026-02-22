import { SupabasePlaceRepository } from "@/data/repositories/supabase-place.repository";
import { GetFeaturedPlacesUseCase } from "@/domain/use-cases/get-featured-places.usecase";
import { GetPlaceBySlugUseCase } from "@/domain/use-cases/get-place-by-slug.usecase";
import { SearchPlacesUseCase } from "@/domain/use-cases/search-places.usecase";
import { CreatePlaceUseCase } from "@/domain/use-cases/create-place.usecase";
import { SupabaseCategoryRepository } from "@/data/repositories/supabase-category.repository";
import { GetCategoriesUseCase } from "@/domain/use-cases/get-categories.usecase";
import { SupabaseAreaRepository } from "@/data/repositories/supabase-area.repository";
import { GetAreasUseCase } from "@/domain/use-cases/get-areas.usecase";
import { GetTrendingPlacesUseCase } from "@/domain/use-cases/get-trending-places.usecase";
import { GetLatestPlacesUseCase } from "@/domain/use-cases/get-latest-places.usecase";
import { GetTopRatedPlacesUseCase } from "@/domain/use-cases/get-top-rated-places.usecase";
import { GetCategoryBySlugUseCase } from "@/domain/use-cases/get-category-by-slug.usecase";

// 1. Repositories
export const placeRepository = new SupabasePlaceRepository();
export const categoryRepository = new SupabaseCategoryRepository();
export const areaRepository = new SupabaseAreaRepository();

// 2. Use Cases
export const getFeaturedPlacesUseCase = new GetFeaturedPlacesUseCase(placeRepository);
export const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);
export const getPlaceBySlugUseCase = new GetPlaceBySlugUseCase(placeRepository);
export const searchPlacesUseCase = new SearchPlacesUseCase(placeRepository);
export const createPlaceUseCase = new CreatePlaceUseCase(placeRepository);
export const getAreasUseCase = new GetAreasUseCase(areaRepository);
export const getTrendingPlacesUseCase = new GetTrendingPlacesUseCase(placeRepository);
export const getLatestPlacesUseCase = new GetLatestPlacesUseCase(placeRepository);
export const getTopRatedPlacesUseCase = new GetTopRatedPlacesUseCase(placeRepository);
export const getCategoryBySlugUseCase = new GetCategoryBySlugUseCase(categoryRepository);
