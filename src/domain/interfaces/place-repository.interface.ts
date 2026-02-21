import { Place } from "../entities/place";

export interface IPlaceRepository {
    getFeaturedPlaces(client?: unknown): Promise<Place[]>;
    getTrendingPlaces(limit: number, client?: unknown): Promise<Place[]>;
    getLatestPlaces(limit: number, client?: unknown): Promise<Place[]>;
    getTopRatedPlaces(limit: number, client?: unknown): Promise<Place[]>;
    getPlacesByCategory(categorySlug: string, client?: unknown): Promise<Place[]>;
    searchPlaces(query: string, areaId?: string, client?: unknown): Promise<Place[]>;

    getPlacesByOwner(userId: string, client?: unknown): Promise<Place[]>;

    // CRUD
    createPlace(data: Partial<Place>, createdBy: string, client?: unknown): Promise<Place>;
    updatePlace(id: string, data: Partial<Place>, client?: unknown): Promise<Place>;
    deletePlace(id: string, client?: unknown): Promise<void>;
    getPlaceById(id: string, client?: unknown): Promise<Place | null>;
    getPlacesByIds(ids: string[], client?: unknown): Promise<Place[]>;
    getPlaceBySlug(slug: string, client?: unknown): Promise<Place | null>;
    getPlaceByGoogleId(googleId: string, client?: unknown): Promise<Place | null>;
}
