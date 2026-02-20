import { SupabaseMarketplaceRepository } from '@/data/repositories/supabase-marketplace.repository';
import { MarketplaceItemCard } from '../components/marketplace-item-card';
import { MarketplaceItemCategory } from '@/domain/entities/marketplace-item';
import { MarketplaceFilters } from '@/domain/repositories/marketplace.repository';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { MARKETPLACE_FORMS } from '@/config/marketplace-forms';
import { Pagination } from '@/presentation/components/shared/pagination';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import { CategoryViewTracker } from '@/presentation/components/marketplace/category-view-tracker';
import { SearchTracker } from '@/presentation/components/marketplace/search-tracker';

export const metadata: Metadata = {
    title: 'تصفح سوق السويس — كل الإعلانات | دليل السويس',
    description: 'تصفح جميع إعلانات سوق السويس: سيارات، عقارات، موبايلات، وأكثر.',
};

export const revalidate = 60; // ISR

const ITEMS_PER_PAGE = 20;

interface MarketplaceBrowsePageProps {
    searchParams: Promise<{
        category?: string;
        query?: string;
        search?: string;
        type?: string;
        minPrice?: string;
        maxPrice?: string;
        area?: string;
        page?: string;
    }>
}

export default async function MarketplaceBrowsePage({ searchParams }: MarketplaceBrowsePageProps) {
    const supabase = await createClient();
    const repository = new SupabaseMarketplaceRepository(supabase);
    const params = await searchParams;

    // Get category config if selected
    const categoryConfig = params.category ? MARKETPLACE_FORMS[params.category] : null;

    // Build filters
    const filters: MarketplaceFilters = {
        category: params.category as MarketplaceItemCategory | undefined,
        minPrice: params.minPrice ? Number(params.minPrice) : undefined,
        maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
        areaId: params.area,
        attributes: {}
    };

    // Handle Sub-Type Filter
    if (params.category && params.type && categoryConfig) {
        const typeKey = categoryConfig.typeSelector.name;
        if (typeKey) {
            filters.attributes![typeKey] = params.type;
        }
    }

    const currentPage = Math.max(1, parseInt(params.page || '1', 10));
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
    const { items, count: total } = await repository.getItems(filters, ITEMS_PER_PAGE, offset);
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    // Get category name from code-based config
    let categoryName = '';
    if (categoryConfig) {
        categoryName = categoryConfig.label;
    }

    const subType = params.type ? decodeURIComponent(params.type) : null;

    return (
        <div className="container mx-auto px-4 py-8">
            <CategoryViewTracker category={params.category || ''} subType={subType} />
            <SearchTracker />
            {/* Page Title & Info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">تصفح الإعلانات</h1>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 md:gap-2 flex-wrap">
                        {categoryName ? (
                            <>
                                <span className="font-bold text-primary">{categoryName}</span>
                                {subType && (
                                    <>
                                        <span className="text-muted-foreground">/</span>
                                        <span className="font-medium text-foreground">{subType}</span>
                                    </>
                                )}
                            </>
                        ) : (
                            <span>جميع الأقسام</span>
                        )}

                        {total > 0 && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-border" />
                                <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-bold">{total} إعلان</span>
                            </>
                        )}
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-8">
                {/* Main Content */}
                <div className="w-full">
                    {items.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {items.map((item) => (
                                    <MarketplaceItemCard key={item.id} item={item} isCompact={true} showDetails={true} />
                                ))}
                            </div>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                baseUrl="/marketplace/browse"
                                searchParams={{
                                    category: params.category,
                                    type: params.type,
                                    minPrice: params.minPrice,
                                    maxPrice: params.maxPrice,
                                    area: params.area,
                                }}
                            />
                        </>
                    ) : (
                        <div className="bg-card rounded-2xl p-12 text-center border border-border">
                            <div className="text-6xl mb-4 opacity-50">🔍</div>
                            <h3 className="text-xl font-bold text-foreground mb-2">لا توجد نتائج</h3>
                            <div className="text-muted-foreground mb-6 max-w-md mx-auto">
                                {(categoryName || subType) && (
                                    <p className="mb-1">
                                        في قسم <span className="font-bold text-foreground">{categoryName}</span>
                                        {subType && <span> - {subType}</span>}
                                    </p>
                                )}
                                <p>جرب تغيير كلمات البحث أو تصفح كل الأقسام</p>
                            </div>

                            {(filters.category || filters.areaId) && (
                                <Link
                                    href="/marketplace/browse"
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors font-medium shadow-sm"
                                >
                                    <Plus className="rotate-45" size={18} />
                                    <span>مسح الفلاتر وعرض الكل</span>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
