import { Place } from "@/domain/entities/place";

export class PlaceMapper {
    static toEntity(row: any): Place {
        if (!row) throw new Error("Cannot map null or undefined row to Place entity");

        return {
            id: row.id,
            slug: row.slug,
            name: row.name,
            description: row.description || undefined,
            address: row.address || '',

            // Location
            areaId: row.area_id || undefined,
            areaName: row.area_name || row.areas?.name,
            areaSlug: row.area_slug || undefined,

            // Category
            categoryId: row.category_id || undefined,
            categoryName: row.category_name || row.categories?.name,
            categorySlug: row.category_slug || row.categories?.slug,

            // Contact
            phone: row.phone || undefined,
            whatsapp: row.whatsapp || undefined,
            website: row.website || undefined,
            googleMapsUrl: row.google_maps_url || undefined,

            // Media
            images: row.images || [],
            videoUrl: row.video_url || undefined,

            // Social
            socialLinks: row.social_links || undefined,

            // Business Info
            type: (row.type as any) || 'business',
            status: (row.status as any) || 'pending',

            // Opening Hours
            opensAt: row.opens_at || null,
            closesAt: row.closes_at || null,
            openingHours: row.opening_hours || undefined,

            // Delivery
            hasDelivery: row.has_delivery || false,
            talabatUrl: row.talabat_url || undefined,
            glovoUrl: row.glovo_url || undefined,
            deliveryPhone: row.delivery_phone || undefined,

            // Ratings
            rating: row.rating || 0,
            reviewCount: row.review_count || 0,
            viewCount: row.view_count || 0,

            // Flags
            isFeatured: row.is_featured || false,
            isVerified: row.is_verified || false,
            isClaimed: row.is_claimed || false,

            // Ownership
            ownerId: row.owner_id || undefined,
            createdBy: row.created_by || undefined,
            createdByName: row.profiles?.full_name || undefined,
            googlePlaceId: row.google_place_id || undefined,

            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    /**
     * Maps a list of database rows to Place entities
     */
    static toEntities(rows: any[] | null): Place[] {
        if (!rows) return [];
        return rows.map(row => this.toEntity(row));
    }
}
