import { Place } from "@/domain/entities/place";
import { IPlaceRepository } from "@/domain/interfaces/place-repository.interface";
import { SupabaseClient } from "@supabase/supabase-js";
import { PlaceMapper } from "../mappers/place.mapper";

export class SupabasePlaceRepository implements IPlaceRepository {
    constructor(private supabase?: SupabaseClient) { }

    async getFeaturedPlaces(client?: unknown): Promise<Place[]> {
        const supabaseClient = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        const { data, error } = await supabaseClient
            .from("places")
            .select("*")
            .eq("status", "active")
            .eq("is_featured", true)
            .limit(10);

        if (error) throw new Error(error.message);

        return PlaceMapper.toEntities(data);
    }

    async getTrendingPlaces(limit: number = 8, client?: unknown): Promise<Place[]> {
        const supabaseClient = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        const { data, error } = await supabaseClient
            .from("places")
            .select("*")
            .eq("status", "active")
            .order("view_count", { ascending: false })
            .limit(limit);

        if (error) return [];
        return PlaceMapper.toEntities(data);
    }

    async getLatestPlaces(limit: number = 8, client?: unknown): Promise<Place[]> {
        const supabaseClient = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        const { data, error } = await supabaseClient
            .from("places")
            .select("*")
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) return [];
        return PlaceMapper.toEntities(data);
    }

    async getTopRatedPlaces(limit: number = 8, client?: unknown): Promise<Place[]> {
        const supabaseClient = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        const { data, error } = await supabaseClient
            .from("places")
            .select("*")
            .eq("status", "active")
            .order("rating", { ascending: false })
            .limit(limit);

        if (error) return [];
        return PlaceMapper.toEntities(data);
    }

    async getPlacesByCategory(categorySlug: string, client?: unknown): Promise<Place[]> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return [];

        const { data: category } = await supabase
            .from("categories")
            .select("id")
            .eq("slug", categorySlug)
            .maybeSingle();

        if (!category) return [];

        const { data, error } = await supabase
            .from("places")
            .select("*")
            .eq("status", "active")
            .eq("category_id", category.id);

        if (error) throw new Error(error.message);
        return PlaceMapper.toEntities(data);
    }

    async getPlaceBySlug(slug: string, client?: unknown): Promise<Place | null> {
        const supabaseClient = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        const { data, error } = await supabaseClient
            .from("places")
            .select("*, categories(name, slug), areas(name), profiles:created_by(full_name)")
            .eq("slug", slug)
            .maybeSingle();

        if (error || !data) return null;
        return PlaceMapper.toEntity(data);
    }

    async searchPlaces(query: string, areaId?: string, client?: unknown): Promise<Place[]> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return [];

        let dbQuery = supabase
            .from("places")
            .select("*")
            .eq("status", "active")
            .ilike("name", `%${query}%`);

        if (areaId && areaId !== 'all') {
            dbQuery = dbQuery.eq("area_id", areaId);
        }

        const { data, error } = await dbQuery;

        if (error) return [];
        return PlaceMapper.toEntities(data);
    }

    async getAllPlaces(client?: unknown): Promise<Place[]> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return [];

        const { data, error } = await supabase
            .from("places")
            .select("*, profiles:created_by(full_name)")
            .order("created_at", { ascending: false });

        if (error) throw new Error(error.message);
        return PlaceMapper.toEntities(data);
    }

    async createPlace(place: Partial<Place>, userId: string, client?: any): Promise<Place> {
        const supabaseClient = client || this.supabase;

        const dbPlace = {
            name: place.name,
            slug: place.slug,
            description: place.description,
            address: place.address,

            area_id: place.areaId,
            latitude: place.latitude,
            longitude: place.longitude,

            category_id: place.categoryId,

            phone: place.phone,
            whatsapp: place.whatsapp,
            google_maps_url: place.googleMapsUrl,
            website: place.website,

            images: place.images,
            video_url: place.videoUrl,
            social_links: place.socialLinks,

            type: place.type || 'business',
            status: place.status || 'pending',

            opens_at: place.opensAt,
            closes_at: place.closesAt,
            opening_hours: place.openingHours,

            has_delivery: place.hasDelivery || false,
            talabat_url: place.talabatUrl,
            glovo_url: place.glovoUrl,
            delivery_phone: place.deliveryPhone,

            is_featured: place.isFeatured || false,
            created_by: userId,
            google_place_id: place.googlePlaceId
        };

        const { data, error } = await supabaseClient
            .from("places")
            .insert(dbPlace)
            .select("*")
            .maybeSingle();

        if (error) throw new Error(error.message);
        if (!data) throw new Error("Failed to create place: No data returned");
        return PlaceMapper.toEntity(data);
    }

    async updatePlace(id: string, place: Partial<Place>, client?: unknown): Promise<Place> {
        const supabaseClient = (client as SupabaseClient) || this.supabase;
        if (!supabaseClient) throw new Error("Supabase client not initialized");

        const updates: any = {};

        // Map camelCase to snake_case
        if (place.name) updates.name = place.name;
        if (place.description !== undefined) updates.description = place.description;
        if (place.address) updates.address = place.address;

        if (place.areaId) updates.area_id = place.areaId;
        if (place.latitude !== undefined) updates.latitude = place.latitude;
        if (place.longitude !== undefined) updates.longitude = place.longitude;

        if (place.categoryId) updates.category_id = place.categoryId;

        if (place.phone !== undefined) updates.phone = place.phone;
        if (place.whatsapp !== undefined) updates.whatsapp = place.whatsapp;
        if (place.website !== undefined) updates.website = place.website;
        if (place.googleMapsUrl !== undefined) updates.google_maps_url = place.googleMapsUrl;

        if (place.images) updates.images = place.images;
        if (place.videoUrl !== undefined) updates.video_url = place.videoUrl;
        if (place.socialLinks) updates.social_links = place.socialLinks;

        if (place.type) updates.type = place.type;
        if (place.status) updates.status = place.status;

        if (place.opensAt !== undefined) updates.opens_at = place.opensAt;
        if (place.closesAt !== undefined) updates.closes_at = place.closesAt;
        if (place.openingHours) updates.opening_hours = place.openingHours;

        if (place.hasDelivery !== undefined) updates.has_delivery = place.hasDelivery;
        if (place.talabatUrl !== undefined) updates.talabat_url = place.talabatUrl;
        if (place.glovoUrl !== undefined) updates.glovo_url = place.glovoUrl;
        if (place.deliveryPhone !== undefined) updates.delivery_phone = place.deliveryPhone;

        if (place.isFeatured !== undefined) updates.is_featured = place.isFeatured;
        if (place.isVerified !== undefined) updates.is_verified = place.isVerified;
        if (place.isClaimed !== undefined) updates.is_claimed = place.isClaimed;

        if (place.ownerId) updates.owner_id = place.ownerId;
        if (place.googlePlaceId !== undefined) updates.google_place_id = place.googlePlaceId;

        const { data, error } = await supabaseClient
            .from("places")
            .update(updates)
            .eq("id", id)
            .select("*")
            .maybeSingle();

        if (error) throw new Error(error.message);
        if (!data) throw new Error("Place not found or update failed");

        return PlaceMapper.toEntity(data);
    }

    async deletePlace(id: string, client?: unknown): Promise<void> {
        const supabaseClient = (client as SupabaseClient) || this.supabase;
        if (!supabaseClient) throw new Error("Supabase client not initialized");
        const { error } = await supabaseClient
            .from('places')
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
    }

    async getPlaceById(id: string, client?: unknown): Promise<Place | null> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return null;

        const { data, error } = await supabase
            .from("places")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (error) return null;
        return data ? PlaceMapper.toEntity(data) : null;
    }

    async getPlacesByIds(ids: string[], client?: unknown): Promise<Place[]> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase || !ids || ids.length === 0) return [];

        const { data, error } = await supabase
            .from("places")
            .select("*")
            .in("id", ids);

        if (error) return [];
        return PlaceMapper.toEntities(data);
    }

    async getPlaceByGoogleId(googleId: string, client?: unknown): Promise<Place | null> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return null;

        const { data, error } = await supabase
            .from("places")
            .select("*")
            .eq("google_place_id", googleId)
            .maybeSingle();

        if (error || !data) return null;
        return PlaceMapper.toEntity(data);
    }


    async getPlacesByOwner(userId: string, client?: unknown): Promise<Place[]> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return [];

        const { data, error } = await supabase
            .from("places")
            .select("*")
            .eq("created_by", userId)
            .order("created_at", { ascending: false });

        if (error) throw new Error(error.message);
        return PlaceMapper.toEntities(data);
    }
}
