import { CategoryDetailsView } from "@/presentation/features/category-details-view";
import { getCategoriesUseCase, getCategoryBySlugUseCase } from "@/di/modules";
import { createReadOnlyClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { PlaceMapper } from "@/data/mappers/place.mapper";

export const revalidate = 3600;

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createReadOnlyClient();
    const currentCategory = await getCategoryBySlugUseCase.execute(slug, supabase);

    if (!currentCategory) {
        return {
            title: 'القسم غير موجود | دليل السويس',
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
    const supabase = await createReadOnlyClient();

    // 1. Get current category by slug directly
    const currentCategory = await getCategoryBySlugUseCase.execute(slug, supabase);

    if (!currentCategory) {
        notFound();
    }

    // 2. Fetch data in parallel
    const [categories, areasData, placesResult] = await Promise.all([
        getCategoriesUseCase.execute(undefined, supabase),
        supabase.from('areas').select('id, name').order('name'),
        supabase
            .from('places')
            .select('id, name, slug, images, category_id, is_featured, address, rating, view_count, review_count, phone, opens_at, closes_at, opening_hours, categories(name, slug)', { count: 'exact' })
            .eq('category_id', currentCategory.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .range(0, 11)
    ]);

    const areas = areasData.data || [];
    const totalPlaces = placesResult.count || 0;
    const places = PlaceMapper.toEntities(placesResult.data || []);

    return (
        <CategoryDetailsView
            category={currentCategory}
            places={places}
            categories={categories}
            areas={areas}
            resultsCount={totalPlaces}
        />
    );
}
