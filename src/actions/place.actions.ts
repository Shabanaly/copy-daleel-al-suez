'use server'

import { SupabasePlaceRepository } from "@/data/repositories/supabase-place.repository";
import { SearchPlacesUseCase } from "@/domain/use-cases/search-places.usecase";
import { Place } from "@/domain/entities/place";
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createPlaceUseCase } from "@/di/modules"
import { createPlaceSchema, updatePlaceSchema } from "@/domain/schemas/place.schema";
import { ActionResult } from "@/types/actions";
import { verifyRole } from "@/lib/auth/role-guard";
import { checkIdempotency, saveIdempotency } from "@/lib/utils/idempotency";

// Define the state type expected by useActionState
export type PlaceState = ActionResult<Place>;

export async function createPlaceAction(rawData: any, idempotencyKey?: string): Promise<PlaceState> {
    try {
        // 0. Check Idempotency
        if (idempotencyKey) {
            const existingResponse = await checkIdempotency(idempotencyKey);
            if (existingResponse) return existingResponse;
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { message: "يجب تسجيل الدخول أولاً", success: false }
        }

        // 1. Validate with Zod
        const result = createPlaceSchema.safeParse(rawData);
        if (!result.success) {
            const errors: Record<string, string[]> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as string;
                if (!errors[path]) errors[path] = [];
                errors[path].push(issue.message);
            });
            return { message: "يرجى تصحيح الأخطاء في النموذج", errors, success: false };
        }

        const validatedData = result.data;

        // 2. Create place with 'pending' status for public submissions
        const place = await createPlaceUseCase.execute({
            ...validatedData,
            status: 'pending'
        } as any, user.id, supabase)

        revalidatePath('/')
        revalidatePath('/places')

        const finalResponse = { success: true, message: "تم إرسال المكان بنجاح، بانتظار المراجعة", data: place as Place };

        // 3. Save Idempotency
        if (idempotencyKey) {
            await saveIdempotency(idempotencyKey, finalResponse, user.id);
        }

        // 4. Notify Admins
        try {
            const { notifyAdminsAction } = await import('./notifications.actions')
            await notifyAdminsAction({
                title: 'مكان جديد بانتظار المراجعة 🆕',
                message: `تم إضافة مكان جديد "${validatedData.name}" بانتظار المراجعة والنشر.`,
                type: 'system_alert',
                data: {
                    placeId: (place as any)?.id || 'unknown',
                    slug: (place as any)?.slug || '',
                    url: '/content-admin/places'
                }
            })
        } catch (notifyError) {
            console.error("Failed to notify admins about new place:", notifyError)
        }

        return finalResponse;
    } catch (error) {
        console.error("Create Place Error:", error)
        const message = error instanceof Error ? error.message : "فشل في إضافة المكان"
        if (message.includes('violates unique constraint "places_slug_key"')) {
            return { message: "هذا الرابط مستخدم بالفعل", errors: { slug: ["هذا الرابط مستخدم بالفعل"] }, success: false }
        }
        return { message, success: false }
    }
}

export async function updatePlaceAction(id: string, rawData: any): Promise<PlaceState> {
    try {
        // 1. Security Check: verifyRole handles auth and profile role
        const { user, profile, error: authError } = await verifyRole(['admin', 'super_admin', 'user']);
        if (authError) return { message: authError, success: false };

        const supabase = await createClient()

        // 2. Validate with Zod (Partial update)
        const result = updatePlaceSchema.safeParse(rawData);
        if (!result.success) {
            const errors: Record<string, string[]> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as string;
                if (!errors[path]) errors[path] = [];
                errors[path].push(issue.message);
            });
            return { message: "يرجى تصحيح الأخطاء في النموذج", errors, success: false };
        }

        const validatedData = result.data;

        // 3. Check existence
        const placeRepository = new SupabasePlaceRepository(supabase);
        const existingPlace = await placeRepository.getPlaceById(id);

        if (!existingPlace) {
            return { message: "المكان غير موجود", success: false }
        }

        // 4. Ownership check (if not admin)
        const isAdmin = profile.role === 'admin' || profile.role === 'super_admin';
        const isOwner = existingPlace.createdBy === user.id || existingPlace.ownerId === user.id;

        if (!isAdmin && !isOwner) {
            return { message: "غير مسموح لك بتعديل هذا المكان", success: false }
        }

        // 5. Update
        const updatedPlace = await placeRepository.updatePlace(id, validatedData as any);

        revalidatePath('/')
        revalidatePath('/places')
        revalidatePath(`/places/${updatedPlace.slug}`)
        revalidatePath(`/content-admin/places`)

        return { success: true, message: "تم تحديث بيانات المكان بنجاح", data: updatedPlace as Place }
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

export async function getPersonalizedRecommendations(interestTag: string): Promise<Place[]> {
    try {
        if (!interestTag) return [];

        const supabase = await createClient();
        const placeRepository = new SupabasePlaceRepository(supabase);

        // If it's a marketplace interest, we might want to return marketplace items or related places
        // For now, let's focus on places. If interestTag starts with market_, we strip it.
        const categorySlug = interestTag.startsWith('market_')
            ? interestTag.replace('market_', '')
            : interestTag;

        // Fetch places in this category
        return await placeRepository.getPlacesByCategory(categorySlug);
    } catch (error) {
        console.error('Error getting personalized recommendations:', error);
        return [];
    }
}
