import { PlacesListView } from "@/presentation/features/places-list-view";
import { getCategoriesUseCase } from "@/di/modules";
import { createClient } from "@/lib/supabase/server";
import { PlaceMapper } from "@/data/mappers/place.mapper";
import { getPlacesAction } from "@/app/actions/get-places-action";

export const dynamic = 'force-dynamic'; // Force dynamic rendering
export const revalidate = 0; // No caching

interface SearchParams {
    search?: string;
    category?: string;
    area?: string;
    sort?: string;
}

export default async function PlacesPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams> | SearchParams;
}) {
    // Await searchParams for Next.js 15 compatibility
    const params = searchParams instanceof Promise ? await searchParams : searchParams;

    const supabase = await createClient()

    // 1. Get all categories and areas for filters
    const [categories, { data: areasData }] = await Promise.all([
        getCategoriesUseCase.execute(undefined, supabase),
        supabase.from('areas').select('id, name').order('name')
    ])

    const areas = areasData || []

    // 2. Build filter params from SearchParams
    // We try to find the category ID if slug is provided
    let categoryId = params.category;
    if (params.category) {
        const decodedCategory = decodeURIComponent(params.category);
        const category = categories.find(c => c.slug === params.category || c.slug === decodedCategory || c.id === params.category);
        if (category) {
            categoryId = category.id;
        }
    }

    // 3. Fetch places using the unified action (this handles pagination/caching internally)
    // For now we keep it simple but use the action to benefit from the work we did
    const { places, total } = await getPlacesAction({
        search: params.search,
        categoryId: categoryId,
        areaId: params.area,
        sort: params.sort || 'recent',
        limit: 12 // Initial load limit
    });

    // Generate title
    let title = "كل الأماكن"
    if (params.search) {
        title = `نتائج البحث: ${params.search}`
    } else if (params.category) {
        const cat = categories.find(c => c.slug === params.category)
        if (cat) title = cat.name
    }

    return (
        <PlacesListView
            places={places}
            title={title}
            categories={categories}
            areas={areas}
            resultsCount={total}
            categoryId={categoryId}
        />
    )
}
