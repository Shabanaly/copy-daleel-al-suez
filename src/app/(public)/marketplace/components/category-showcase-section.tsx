'use client'

import { MarketplaceItemCard } from './marketplace-item-card';
import { ChevronLeft, ChevronRight, Store } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';
import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { CATEGORY_ICONS } from '@/lib/constants/marketplace';
import { ShowcaseSection } from '@/actions/marketplace-search.actions';

interface CategoryShowcaseSectionProps {
    data: ShowcaseSection;
}

export function CategoryShowcaseSection({ data }: CategoryShowcaseSectionProps) {
    const { title, icon, category, subType, items } = data;
    const IconComponent = CATEGORY_ICONS[icon] || Store;

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
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect]);

    if (!items || items.length === 0) return null;

    // Build View All Link
    let viewAllHref = `/marketplace/browse?category=${category}`;
    if (subType) {
        viewAllHref += `&type=${encodeURIComponent(subType)}`;
    }

    return (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 bg-card/30 rounded-3xl p-4 md:p-6 border border-border/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                        <IconComponent size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground leading-tight">{title}</h2>
                        <Link href={viewAllHref} className="text-[11px] text-muted-foreground hover:text-primary font-medium hover:underline transition-colors">
                            عرض الكل
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={scrollNext}
                        disabled={!nextBtnEnabled}
                        className={cn(
                            "w-8 h-8 flex items-center justify-center rounded-full border border-border bg-background transition-all active:scale-95 shadow-sm",
                            !nextBtnEnabled ? "opacity-30 cursor-not-allowed" : "hover:bg-primary hover:border-primary hover:text-white"
                        )}
                        aria-label="Next slide"
                    >
                        <ChevronRight size={16} />
                    </button>
                    <button
                        onClick={scrollPrev}
                        disabled={!prevBtnEnabled}
                        className={cn(
                            "w-8 h-8 flex items-center justify-center rounded-full border border-border bg-background transition-all active:scale-95 shadow-sm",
                            !prevBtnEnabled ? "opacity-30 cursor-not-allowed" : "hover:bg-primary hover:border-primary hover:text-white"
                        )}
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={16} />
                    </button>
                </div>
            </div>

            <div className="overflow-hidden cursor-grab active:cursor-grabbing px-1 -mx-1 py-2" ref={emblaRef}>
                <div className="flex gap-3">
                    {items.map((item) => (
                        <div key={item.id} className="flex-[0_0_220px] min-w-0">
                            <MarketplaceItemCard item={item} isCompact={true} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
