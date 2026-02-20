import { createClient } from "@/lib/supabase/server";
import { PlaceComparisonView } from "@/presentation/features/places/components/place-comparison-view";
import { notFound, redirect } from "next/navigation";
import { Place } from "@/domain/entities/place";

// Force dynamic rendering since we use searchParams
export const dynamic = 'force-dynamic';

interface SearchParams {
    ids?: string;
}

export default async function ComparePage({
    searchParams,
}: {
    searchParams: Promise<SearchParams> | SearchParams;
}) {
    // Await params for Nextjs 15
    const params = searchParams instanceof Promise ? await searchParams : searchParams;
    const idsString = params.ids;

    if (!idsString) {
        redirect('/places');
    }

    const ids = idsString.split(',').filter(Boolean);

    if (ids.length === 0) {
        redirect('/places');
    }

    const supabase = await createClient();
    const { data: placesData, error } = await supabase
        .from('places')
        .select('*, categories(name), areas(name)')
        .in('id', ids)
        .eq('status', 'active');

    if (error || !placesData || placesData.length === 0) {
        // If no places found, maybe they were deleted or invalid IDs
        return notFound();
    }

    // Map to Place entities
    interface PlaceQueryResult {
        id: string
        name: string
        slug: string
        description: string
        address: string
        phone: string
        whatsapp: string
        website: string
        facebook: string
        instagram: string
        map_link: string
        images: string[]
        category_id: string
        categories: { name: string } | null
        area_id: string
        areas: { name: string } | null
        rating: number
        review_count: number
        is_featured: boolean
        status: string
        type: string
        created_at: string
        talabat_url: string
        glovo_url: string
        delivery_phone: string
        opens_at: string | null
        closes_at: string | null
        [key: string]: unknown
    }

    const places: Place[] = placesData.map((record: any) => {
        const p = record as PlaceQueryResult
        return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: p.description,
            address: p.address,
            phone: p.phone,
            whatsapp: p.whatsapp,
            website: p.website,
            facebook: p.facebook,
            instagram: p.instagram,
            mapLink: p.map_link,
            images: p.images || [],
            categoryId: p.category_id,
            categoryName: p.categories?.name,
            areaId: p.area_id,
            areaName: p.areas?.name,
            rating: p.rating || 0,
            reviewCount: p.review_count || 0,
            isFeatured: p.is_featured || false,
            status: (p.status as "active" | "pending" | "inactive") || "active",
            type: p.type as "business" | "professional",
            createdAt: p.created_at,
            talabatUrl: p.talabat_url,
            glovoUrl: p.glovo_url,
            deliveryPhone: p.delivery_phone,
            opensAt: p.opens_at,
            closesAt: p.closes_at,
            updatedAt: new Date().toISOString(),
            hasDelivery: false,
            isVerified: false,
            isClaimed: false,
        }
    });

    return <PlaceComparisonView places={places} />;
}
