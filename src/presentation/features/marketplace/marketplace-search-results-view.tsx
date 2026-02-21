'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MarketplaceSearchResult } from '@/actions/marketplace-search.actions'
import { MarketplaceFilters } from '@/domain/repositories/marketplace.repository'
import { MarketplaceItemCard } from '@/app/(public)/marketplace/components/marketplace-item-card'
import { Loader2, Search, Filter, SlidersHorizontal, LayoutGrid, List, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MarketplaceSearchSidebar } from '@/presentation/features/marketplace/components/marketplace-search-sidebar'

interface MarketplaceSearchResultsViewProps {
    initialItems: MarketplaceSearchResult[]
    initialFilters?: MarketplaceFilters
    // Backward compatibility props (optional now)
    searchQuery?: string
    activeCategory?: string
    areaId?: string
    districtId?: string
    minPrice?: number | string
    maxPrice?: number | string
    categoriesWithCounts?: any[]
}

export function MarketplaceSearchResultsView({
    initialItems,
    initialFilters,
    searchQuery,
    activeCategory: initialActiveCategory,
    areaId,
    districtId,
    minPrice,
    maxPrice
}: MarketplaceSearchResultsViewProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Determine initial values prioritizing initialFilters
    const effectiveSearchQuery = initialFilters?.query || searchQuery || ''
    const effectiveActiveCategory = initialFilters?.category || initialActiveCategory || 'all'
    const effectiveAreaId = initialFilters?.areaId || areaId
    const effectiveDistrictId = initialFilters?.districtId || districtId
    const effectiveMinPrice = initialFilters?.minPrice?.toString() || minPrice?.toString()
    const effectiveMaxPrice = initialFilters?.maxPrice?.toString() || maxPrice?.toString()

    const [activeCategory, setActiveCategory] = useState<string>(effectiveActiveCategory)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    // Derived: Categories with counts from ALL search results
    const categoriesWithCounts = useMemo(() => {
        const counts: Record<string, number> = {}
        let total = 0

        initialItems.forEach(item => {
            counts[item.category] = (counts[item.category] || 0) + 1
            total++
        })

        return {
            all: total,
            ...counts
        }
    }, [initialItems])

    // Filter items based on active tab (Client-side for fast switching)
    const filteredItems = useMemo(() => {
        if (activeCategory === 'all') return initialItems
        return initialItems.filter(item => item.category === activeCategory)
    }, [initialItems, activeCategory])

    const queryFromParams = searchParams.get('search') || effectiveSearchQuery

    // Construct filters object for sidebar
    const currentFilters = useMemo(() => ({
        query: queryFromParams,
        category: activeCategory,
        areaId: effectiveAreaId,
        districtId: effectiveDistrictId,
        minPrice: effectiveMinPrice,
        maxPrice: effectiveMaxPrice
    }), [queryFromParams, activeCategory, effectiveAreaId, effectiveMinPrice, effectiveMaxPrice])

    // Helper to map MarketplaceSearchResult to MarketplaceItem (partial compatibility for display)
    const mapToCardItem = (item: MarketplaceSearchResult): any => ({
        ...item,
        images: item.image ? [item.image] : [],
        seller_id: 'unknown', // Not needed for search display
        status: 'active',
        is_featured: false,
        viewCount: 0,
        seller_name: '',
        seller_phone: '',
        created_at: item.created_at,
        updated_at: item.created_at
    })


    return (
        <div className="container mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">نتائج البحث</h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            {queryFromParams ? (
                                <>عرض النتائج عن <span className="text-primary font-bold">&quot;{queryFromParams}&quot;</span></>
                            ) : (
                                <>تصفح كل المنتجات</>
                            )}
                            <span className="mx-2 text-border">|</span>
                            <span>{initialItems.length} منتج متاح</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn("p-2 rounded-lg border transition-all", viewMode === 'grid' ? "bg-primary/10 border-primary/20 text-primary" : "bg-card border-border text-muted-foreground hover:text-foreground")}
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn("p-2 rounded-lg border transition-all", viewMode === 'list' ? "bg-primary/10 border-primary/20 text-primary" : "bg-card border-border text-muted-foreground hover:text-foreground")}
                        >
                            <List size={20} />
                        </button>
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-foreground font-medium hover:border-primary/50 transition-all"
                        >
                            <SlidersHorizontal size={18} />
                            <span>الفلاتر</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block lg:col-span-1">
                    <MarketplaceSearchSidebar initialFilters={currentFilters} />
                </aside>

                {/* Results Grid */}
                <main className="lg:col-span-3">
                    {filteredItems.length > 0 ? (
                        <div className={cn(
                            viewMode === 'grid'
                                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 animate-in fade-in duration-500"
                                : "flex flex-col gap-4 animate-in fade-in duration-500"
                        )}>
                            {filteredItems.map(item => (
                                <div key={item.id} className={cn(viewMode === 'list' && "w-full")}>
                                    <MarketplaceItemCard item={mapToCardItem(item)} viewMode={viewMode} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-card rounded-3xl p-16 text-center shadow-sm border border-border flex flex-col items-center">
                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                                <Search size={40} className="text-muted-foreground/30" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-2">لا توجد نتائج في هذا القسم</h3>
                            {queryFromParams && <p className="text-muted-foreground mt-1">نتائج البحث عن &quot;{queryFromParams}&quot;</p>}
                            <p className="text-muted-foreground mb-8 max-w-sm">
                                جرب البحث في أقسام أخرى أو قم بمسح الفلاتر للعثور على ما تبحث عنه.
                            </p>
                            <button
                                onClick={() => setActiveCategory('all')}
                                className="px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                            >
                                عرض كل النتائج
                            </button>
                        </div>
                    )}
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-card shadow-2xl animate-in slide-in-from-left duration-500 flex flex-col border-r border-border">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h2 className="font-bold text-xl flex items-center gap-2 text-foreground">
                                <Filter size={20} className="text-primary" />
                                الفلاتر
                            </h2>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-muted rounded-full text-foreground">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <MarketplaceSearchSidebar initialFilters={currentFilters} onApply={() => setIsSidebarOpen(false)} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function TabButton({ label, count, isActive, onClick }: { label: string, count: number, isActive: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap border min-w-max",
                isActive
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                    : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
            )}
        >
            <span>{label}</span>
            <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-full transition-colors",
                isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
            )}>
                {count}
            </span>
        </button>
    )
}
