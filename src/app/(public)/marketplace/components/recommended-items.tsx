'use client'

import { useState, useEffect, useCallback } from 'react';
import { getRecommendedItems } from '@/actions/marketplace-search.actions';
import { MarketplaceItemCard } from './marketplace-item-card';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { MarketplaceItem } from '@/domain/entities/marketplace-item';
import { cn } from '@/lib/utils';

export function RecommendedItems() {
    const [items, setItems] = useState<MarketplaceItem[]>([]);
    const [emblaRef, emblaApi] = useEmblaCarousel({
        direction: 'rtl',
        align: 'start',
        slidesToScroll: 1,
        containScroll: 'trimSnaps'
    });

    const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
    const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setPrevBtnEnabled(emblaApi.canScrollPrev());
        setNextBtnEnabled(emblaApi.canScrollNext());
    }, [emblaApi]);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                // Get local history for guest recommendations
                const localHistoryRaw = localStorage.getItem('marketplace_history') || '[]'
                const localHistory = JSON.parse(localHistoryRaw)

                const data = await getRecommendedItems(localHistory);
                setItems(data);
            } catch (error) {
                console.error('Failed to load recommendations', error);
            }
        };
        fetchItems();
    }, []);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect]);

    if (items.length === 0) return null;

    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                        <Sparkles className="text-amber-500 fill-amber-500 animate-pulse" size={20} />
                        <span>اخترنا لك</span>
                    </h2>
                    <p className="text-[12px] text-muted-foreground mt-0.5 font-medium">بناءً على اهتماماتك السابقة</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={scrollNext}
                        disabled={!nextBtnEnabled}
                        className={cn(
                            "p-2 rounded-full border border-border bg-background transition-all active:scale-90",
                            !nextBtnEnabled ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/5 hover:border-primary/30 hover:text-primary"
                        )}
                    >
                        <ChevronRight size={18} />
                    </button>
                    <button
                        onClick={scrollPrev}
                        disabled={!prevBtnEnabled}
                        className={cn(
                            "p-2 rounded-full border border-border bg-background transition-all active:scale-90",
                            !prevBtnEnabled ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/5 hover:border-primary/30 hover:text-primary"
                        )}
                    >
                        <ChevronLeft size={18} />
                    </button>
                </div>
            </div>

            <div className="overflow-hidden cursor-grab active:cursor-grabbing px-0" ref={emblaRef}>
                <div className="flex gap-3">
                    {items.map((item) => (
                        <div key={item.id} className="flex-[0_0_200px] sm:flex-[0_0_260px] min-w-0">
                            <MarketplaceItemCard item={item} isCompact={true} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mt-12" />
        </section>
    );
}
