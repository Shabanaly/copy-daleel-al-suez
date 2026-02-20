'use client';

import Link from 'next/link';
import { Category } from '@/domain/entities/category';
import { cn } from '@/lib/utils';
import { CategoryIcon } from '@/presentation/features/categories/components/category-icon';

interface QuickDiscoveryGridProps {
    categories?: {
        id: string;
        name: string;
        slug: string;
        icon?: string;
        placesCount?: number;
        previewPlaces?: { id: string, name: string }[];
    }[];
}

const getCategoryColor = (slug: string) => {
    switch (slug) {
        case 'restaurants': return 'bg-orange-500';
        case 'pharmacies': return 'bg-red-500';
        case 'cafes': return 'bg-amber-600';
        case 'banks': return 'bg-blue-600';
        case 'shopping': return 'bg-pink-500';
        case 'auto-services': return 'bg-slate-700';
        case 'education': return 'bg-indigo-600';
        case 'health':
        case 'medical': return 'bg-emerald-500';
        case 'real-estate': return 'bg-sky-500';
        case 'services': return 'bg-gray-600';
        default: return 'bg-primary';
    }
}

export function QuickDiscoveryGrid({ categories = [] }: QuickDiscoveryGridProps) {
    if (categories.length === 0) return <QuickDiscoveryGridSkeleton />;

    const displayCategories = categories.slice(0, 8);

    return (
        <section className="container mx-auto px-4 py-16">
            {/* Mobile: Horizontal scroll, Desktop: Centered Flex/Grid */}
            <div className="flex overflow-x-auto pb-8 md:pb-0 md:flex-wrap md:justify-center gap-6 md:gap-12 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                {displayCategories.map((cat, index) => {
                    const colorClass = getCategoryColor(cat.slug);

                    return (
                        <Link
                            key={cat.id}
                            href={`/categories/${cat.slug}`}
                            prefetch={true}
                            className="group flex flex-col items-center gap-4 flex-shrink-0 w-24 md:w-32 transition-all duration-300"
                        >
                            {/* Circular Icon - Tripadvisor Style */}
                            <div className={cn(
                                "w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl group-hover:rotate-3 relative",
                                colorClass,
                                "ring-4 ring-background shadow-primary/20"
                            )}>
                                <CategoryIcon name={cat.icon || null} size={32} className="md:w-12 md:h-12 drop-shadow-md" />

                                {/* Pulse Effect on Hover */}
                                <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:animate-ping group-hover:opacity-20 transition-opacity"></div>
                            </div>

                            {/* Label */}
                            <div className="text-center space-y-1">
                                <h3 className="font-black text-sm md:text-lg text-foreground group-hover:text-primary transition-colors">
                                    {cat.name}
                                </h3>
                                {cat.placesCount !== undefined && (
                                    <div className="flex items-center justify-center">
                                        <span className="text-[10px] md:text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                            {cat.placesCount} مكان
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Link>
                    )
                })}
            </div>
        </section>
    );
}

export function QuickDiscoveryGridSkeleton() {
    return (
        <section className="container mx-auto px-4 py-12 md:py-16">
            <div className="mb-10 text-center md:text-right">
                <div className="h-10 w-64 bg-muted animate-pulse rounded-lg mb-4 mx-auto md:mx-0 md:mr-0 md:ml-auto" />
                <div className="h-6 w-48 bg-muted animate-pulse rounded-lg mx-auto md:mx-0 md:mr-0 md:ml-auto" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-24 md:h-32 bg-muted/50 animate-pulse rounded-3xl" />
                ))}
            </div>
        </section>
    )
}
