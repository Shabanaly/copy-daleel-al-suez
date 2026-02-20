/**
 * PlacesListClient Component
 * 
 * Client-side wrapper for PlacesList with:
 * - Grid/List view toggle
 * - Compare mode with floating comparison bar
 * - Up to 3 places comparison
 * - Pagination (Load More)
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Place } from '@/domain/entities/place';
import { PlaceCard } from './place-card';
import { PlaceListItem } from './place-list-item';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import { cn } from '@/lib/utils';
import {
    LayoutGrid,
    List,
    GitCompareArrows,
    X,
    ArrowLeft,
    Scale,
    ChevronDown
} from 'lucide-react';
import Image from 'next/image';

import { getPlacesAction } from '@/app/actions/get-places-action';
import { useViewIncrement } from '@/presentation/hooks/use-view-increment'; // Verify if needed, keeping context

interface PlacesListClientProps {
    initialPlaces: Place[];
    resultsCount: number;
    categoryId?: string;
    isCompact?: boolean;
}

type ViewMode = 'grid' | 'list';

const LOAD_LIMIT = 12;

export function PlacesListClient({ initialPlaces, resultsCount, categoryId = '', isCompact = false }: PlacesListClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [compareMode, setCompareMode] = useState(false);
    const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);

    // Pagination State
    const [places, setPlaces] = useState<Place[]>(initialPlaces);
    const [lastCursor, setLastCursor] = useState<string | undefined>(
        initialPlaces.length > 0 ? initialPlaces[initialPlaces.length - 1].createdAt : undefined
    );
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialPlaces.length < resultsCount);

    // Sync state with props when filters change (e.g. initialPlaces changes from server)
    useEffect(() => {
        setPlaces(initialPlaces);
        setLastCursor(initialPlaces.length > 0 ? initialPlaces[initialPlaces.length - 1].createdAt : undefined);
        setHasMore(initialPlaces.length < resultsCount);
    }, [initialPlaces, resultsCount]);

    // Derived visible count is no longer needed as we render all 'places'
    // but we might want to keep some local "show more" if we fetched a lot.
    // However, the requested behavior is "Load More" from server.
    // So we just render 'places'.

    const handleCompare = useCallback((placeId: string) => {
        setSelectedPlaces(prev => {
            if (prev.includes(placeId)) {
                return prev.filter(id => id !== placeId);
            }
            if (prev.length >= 3) return prev; // max 3
            return [...prev, placeId];
        });
    }, []);

    const toggleCompareMode = () => {
        setCompareMode(prev => !prev);
        if (compareMode) {
            setSelectedPlaces([]); // reset on exit
        }
    };

    const handleLoadMore = async () => {
        if (isLoading || !hasMore || !lastCursor) return;

        setIsLoading(true);
        try {
            // Get current filter state from searchParams
            const currentParams = {
                categoryId: categoryId || searchParams.get('category') || undefined,
                areaId: searchParams.get('area') || undefined,
                search: searchParams.get('search') || undefined,
                sort: searchParams.get('sort') || 'recent',
                lastCursor,
                limit: LOAD_LIMIT
            };

            const { places: newPlaces, total } = await getPlacesAction(currentParams);

            if (newPlaces.length === 0) {
                setHasMore(false);
                return;
            }

            const updatedPlaces = [...places, ...newPlaces];
            setPlaces(updatedPlaces);
            // Update cursor based on the last item's created_at for 'recent' sort
            // Note: If sort is 'name', we should use name as cursor.
            const newCursor = currentParams.sort === 'name'
                ? newPlaces[newPlaces.length - 1].name
                : newPlaces[newPlaces.length - 1].createdAt;

            setLastCursor(newCursor);

            if (updatedPlaces.length >= total) {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to load more places:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const remainingCount = Math.max(0, resultsCount - places.length)
    const selectedPlaceObjects = places.filter(p => selectedPlaces.includes(p.id));

    return (
        <div>
            {/* Toolbar - Minimalist & Integrated */}
            <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-3">
                    <div className="lg:hidden flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-xl text-primary font-black text-xs uppercase">
                        {resultsCount} نتيجة
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Compare Toggle */}
                    <Button
                        variant={compareMode ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={toggleCompareMode}
                        icon={<GitCompareArrows className="w-4 h-4" />}
                        className="h-10 rounded-xl font-bold"
                    >
                        <span className="hidden sm:inline">
                            {compareMode ? 'إلغاء المقارنة' : 'المقارنة الذكية'}
                        </span>
                    </Button>

                    {/* View Toggle */}
                    <div className="flex bg-muted/50 backdrop-blur-sm rounded-xl p-1 border border-border/10">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid'
                                ? 'bg-background text-primary shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                            title="عرض شبكي"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'list'
                                ? 'bg-background text-primary shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                            title="عرض قائمة"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Compare Mode Banner */}
            {compareMode && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Scale className="w-5 h-5 text-primary" />
                        <div>
                            <p className="font-bold text-foreground text-sm">وضع المقارنة</p>
                            <p className="text-muted-foreground text-xs">
                                اختر حتى 3 أماكن للمقارنة ({selectedPlaces.length}/3)
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleCompareMode}
                        icon={<X className="w-4 h-4" />}
                    >
                        إلغاء
                    </Button>
                </div>
            )}

            {/* Places Grid/List */}
            {places.length > 0 ? (
                <>
                    {viewMode === 'grid' ? (
                        <div className={cn(
                            "grid gap-6",
                            isCompact
                                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
                                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        )}>
                            {places.map((place) => (
                                <PlaceCard
                                    key={place.id}
                                    place={place}
                                    showCompare={compareMode}
                                    onCompare={handleCompare}
                                    isInComparison={selectedPlaces.includes(place.id)}
                                    isCompact={isCompact}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {places.map((place) => (
                                <PlaceListItem
                                    key={place.id}
                                    place={place}
                                    showCompare={compareMode}
                                    onCompare={handleCompare}
                                    isInComparison={selectedPlaces.includes(place.id)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Load More Button */}
                    {hasMore && (
                        <div className="mt-10 flex justify-center">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={handleLoadMore}
                                disabled={isLoading}
                                className="min-w-[200px]"
                                iconRight={!isLoading ? <ChevronDown className="w-4 h-4" /> : undefined}
                            >
                                {isLoading ? 'جاري التحميل...' : `عرض المزيد (متبقي ${remainingCount})`}
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20">
                    <div className="bg-card rounded-2xl border-2 border-dashed border-border p-12 max-w-lg mx-auto">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-foreground mb-2">
                            لا توجد نتائج
                        </h3>
                        <p className="text-muted-foreground">
                            لم نعثر على أماكن مطابقة لبحثك. جرب تعديل الفلاتر أو البحث بكلمات مختلفة.
                        </p>
                    </div>
                </div>
            )}

            {/* Floating Comparison Bar */}
            {compareMode && selectedPlaces.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-2xl">
                    <div className="container mx-auto px-4 py-3">
                        <div className="flex items-center justify-between gap-4">
                            {/* Selected Places */}
                            <div className="flex items-center gap-3 flex-1 min-w-0 overflow-x-auto">
                                {selectedPlaceObjects.map((place) => (
                                    <div
                                        key={place.id}
                                        className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 flex-shrink-0"
                                    >
                                        {place.images && place.images.length > 0 && (
                                            <div className="relative w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={place.images[0]}
                                                    alt={place.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="32px"
                                                    referrerPolicy="no-referrer"
                                                />
                                            </div>
                                        )}
                                        <span className="text-sm font-medium text-foreground truncate max-w-[100px]">
                                            {place.name}
                                        </span>
                                        <button
                                            onClick={() => handleCompare(place.id)}
                                            className="text-muted-foreground hover:text-red-500 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                {/* Empty Slots */}
                                {Array.from({ length: 3 - selectedPlaces.length }).map((_, i) => (
                                    <div
                                        key={`empty-${i}`}
                                        className="w-28 h-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center flex-shrink-0"
                                    >
                                        <span className="text-xs text-muted-foreground">+ أضف مكان</span>
                                    </div>
                                ))}
                            </div>

                            {/* Compare Button */}
                            <Button
                                variant="primary"
                                size="sm"
                                disabled={selectedPlaces.length < 2}
                                onClick={() => {
                                    const ids = selectedPlaces.join(',');
                                    router.push(`/places/compare?ids=${ids}`);
                                }}
                                icon={<GitCompareArrows className="w-4 h-4" />}
                                className="flex-shrink-0"
                            >
                                قارن ({selectedPlaces.length})
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Spacer when comparison bar is visible */}
            {compareMode && selectedPlaces.length > 0 && (
                <div className="h-20" />
            )}
        </div>
    );
}
