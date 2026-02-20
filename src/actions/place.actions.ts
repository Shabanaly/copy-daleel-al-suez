'use server'

import { SupabasePlaceRepository } from "@/data/repositories/supabase-place.repository";
import { SearchPlacesUseCase } from "@/domain/use-cases/search-places.usecase";
import { Place } from "@/domain/entities/place";
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createPlaceUseCase } from "@/di/modules"

// Define the state type expected by useActionState
export type PlaceState = {
    message?: string
    errors?: Record<string, string[]>
    success?: boolean
    data?: Place
}

export async function createPlaceAction(data: Partial<Place>): Promise<PlaceState> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { message: "يجب تسجيل الدخول أولاً", success: false }
        }

        // Sanitize Data
        if (data.areaId === '') delete data.areaId
        if (data.categoryId === '') delete data.categoryId

        // Validate required fields
        const errors: Record<string, string[]> = {}
        if (!data.name) errors.name = ["الاسم مطلوب"]
        if (!data.slug) errors.slug = ["الرابط (Slug) مطلوب"]
        if (!data.categoryId) errors.categoryId = ["التصنيف مطلوب"]

        if (Object.keys(errors).length > 0) {
            return { message: "يرجى التأكد من الحقول المطلوبة", errors, success: false }
        }

        // Create place with 'pending' status for public submissions
        const place = await createPlaceUseCase.execute({
            ...data,
            status: 'pending'
        }, user.id, supabase)

        revalidatePath('/')
        revalidatePath('/places')

        return { success: true, message: "تم إرسال المكان بنجاح، بانتظار المراجعة", data: place }
    } catch (error) {
        console.error("Create Place Error:", error)
        const message = error instanceof Error ? error.message : "فشل في إضافة المكان"
        if (message.includes('violates unique constraint "places_slug_key"')) {
            return { message: "هذا الرابط مستخدم بالفعل", errors: { slug: ["هذا الرابط مستخدم بالفعل"] }, success: false }
        }
        return { message, success: false }
    }
}

export async function updatePlaceAction(id: string, data: Partial<Place>): Promise<PlaceState> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { message: "يجب تسجيل الدخول أولاً", success: false }
        }

        // Check if user is owner or admin (this check is partly done in repository/supabase RLS too)
        const placeRepository = new SupabasePlaceRepository(supabase);
        const existingPlace = await placeRepository.getPlaceById(id);

        if (!existingPlace) {
            return { message: "المكان غير موجود", success: false }
        }

        // Sanitize Data
        if (data.areaId === '') data.areaId = undefined
        if (data.categoryId === '') data.categoryId = undefined

        const updatedPlace = await placeRepository.updatePlace(id, data);

        revalidatePath('/')
        revalidatePath('/places')
        revalidatePath(`/places/${updatedPlace.slug}`)
        revalidatePath(`/content-admin/places`)

        return { success: true, message: "تم تحديث بيانات المكان بنجاح", data: updatedPlace }
    } catch (error) {
        console.error("Update Place Error:", error)
        const message = error instanceof Error ? error.message : "فشل في تحديث المكان"
        return { message, success: false }
    }
}

// Simplified Place type for search results to reduce payload size
export type SearchResultPlace = Pick<Place, 'id' | 'name' | 'slug' | 'categoryName' | 'rating' | 'images' | 'areaName'>;

export async function searchPlacesAction(query: string, areaId?: string): Promise<SearchResultPlace[]> {
    try {
        if (!query || query.trim().length < 2) return [];

        const placeRepository = new SupabasePlaceRepository();
        const searchPlacesUseCase = new SearchPlacesUseCase(placeRepository);

        const places = await searchPlacesUseCase.execute(query.trim(), areaId);

        // Map to simplified result
        return places.map(place => ({
            id: place.id,
            name: place.name,
            slug: place.slug,
            categoryName: place.categoryName,
            rating: place.rating,
            images: place.images,
            areaName: place.areaName
        }));
    } catch (error) {
        console.error('Error searching places:', error);
        return [];
    }
}

export async function getMultiplePlacesAction(ids: string[]): Promise<Place[]> {
    try {
        if (!ids || ids.length === 0) return [];

        const supabase = await createClient()
        const placeRepository = new SupabasePlaceRepository(supabase);

        // Fetch places by IDs
        const places = await placeRepository.getPlacesByIds(ids);

        // Sort to match the input order (important for "Recently Viewed")
        const placeMap = new Map(places.map((p: Place) => [p.id, p]));
        return ids.map(id => placeMap.get(id)).filter(Boolean) as Place[];
    } catch (error) {
        console.error('Error fetching multiple places:', error);
        return [];
    }
}
