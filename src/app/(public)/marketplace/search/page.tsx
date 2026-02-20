import { SupabaseMarketplaceRepository } from '@/data/repositories/supabase-marketplace.repository';
import { MarketplaceItemCategory } from '@/domain/entities/marketplace-item';
import { MarketplaceFilters } from '@/domain/repositories/marketplace.repository';
import { createClient } from '@/lib/supabase/server';
import { MarketplaceSearchResultsView } from '@/presentation/features/marketplace/marketplace-search-results-view';

export const dynamic = 'force-dynamic'; // بحث = بيانات متغيرة دائماً

interface MarketplaceSearchPageProps {
    searchParams: Promise<{
        category?: string;
        query?: string;
        search?: string;
        minPrice?: string;
        maxPrice?: string;
        areaId?: string;
        sort?: string;
        listing_type?: string;
        brand?: string;
        ram?: string;
        storage?: string;
    }>;
}

export default async function MarketplaceSearchPage({ searchParams }: MarketplaceSearchPageProps) {
    const supabase = await createClient();
    const repository = new SupabaseMarketplaceRepository(supabase);
    const params = await searchParams;

    // Build structured filters — legacy params go into attributes
    const attributes: Record<string, string> = {};
    if (params.listing_type) attributes.listing_type = params.listing_type;
    if (params.brand) attributes.brand = params.brand;
    if (params.ram) attributes.ram = params.ram;
    if (params.storage) attributes.storage = params.storage;

    const filters: MarketplaceFilters = {
        category: params.category as MarketplaceItemCategory | undefined,
        query: params.search || params.query,
        minPrice: params.minPrice ? Number(params.minPrice) : undefined,
        maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
        areaId: params.areaId,
        attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
    };

    const { items } = await repository.getItems(filters);

    // Map MarketplaceItem to MarketplaceSearchResult for the view component
    const mappedItems = items.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        image: item.images && item.images.length > 0 ? item.images[0] : undefined,
        slug: item.slug || item.id,
        price: item.price || 0,
        condition: item.condition || 'new',
        category: item.category,
        created_at: item.created_at || new Date().toISOString()
    }));

    return (
        <div className="min-h-screen bg-background">
            <MarketplaceSearchResultsView
                initialItems={mappedItems}
                initialFilters={filters}
            />
        </div>
    );
}
