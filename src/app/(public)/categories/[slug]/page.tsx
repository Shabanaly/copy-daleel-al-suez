import { CategoryDetailsView } from "@/presentation/features/category-details-view";
import { getCategoriesUseCase } from "@/di/modules";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();
    const categories = await getCategoriesUseCase.execute(undefined, supabase)
    const currentCategory = categories.find(c => c.slug === slug)

    if (!currentCategory) {
        return {
            title: 'Category Not Found',
        }
    }

    const title = `${currentCategory.name} | دليل السويس`;
    const description = `أفضل أماكن ${currentCategory.name} في السويس. تصفح التقييمات والعناوين وأرقام الهواتف.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            locale: 'ar_EG',
            siteName: 'دليل السويس',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
        alternates: {
            canonical: `/categories/${currentCategory.slug}`,
        }
    }
}

export default async function CategoryDetailsPage({
    params,
}: Props) {
    const { slug } = await params;
    const supabase = await createClient()

    // Get all categories for filters
    const categories = await getCategoriesUseCase.execute(undefined, supabase)

    // Find the current category
    const currentCategory = categories.find(c => c.slug === slug)
    if (!currentCategory) {
        notFound()
    }

    // Get places in this category (Initial Batch)
    const { data: placesData, count: totalPlaces } = await supabase
        .from('places')
        .select('*, categories(name), areas(name)', { count: 'exact' })
        .eq('category_id', currentCategory.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(0, 11) // Fetch first 12 items

    // Get areas for filters
    const { data: areasData } = await supabase
        .from('areas')
        .select('id, name')
        .order('name')

    const areas = areasData || []

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
        [key: string]: unknown
    }
    const places = (placesData || []).map((record: Record<string, unknown>) => {
        const p = record as unknown as PlaceQueryResult
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
            updatedAt: (typeof p.updated_at === 'string' && p.updated_at) ? p.updated_at : new Date().toISOString(),
            hasDelivery: false,
            isVerified: false,
            isClaimed: false,
        }
    })

    return (
        <CategoryDetailsView
            category={currentCategory}
            places={places}
            categories={categories}
            areas={areas}
            resultsCount={totalPlaces || 0}
        />
    )
}
