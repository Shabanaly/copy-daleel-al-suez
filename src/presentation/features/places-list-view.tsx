import { Place } from "@/domain/entities/place";
import { Category } from "@/domain/entities/category";
import { PlacesFilters } from "@/presentation/features/places/components/places-filters";
import { PlacesListClient } from "@/presentation/features/places/components/places-list-client";
import { MapPin } from "lucide-react";

interface PlacesListViewProps {
    places: Place[];
    title?: string;
    categories: Category[];
    areas: { id: string; name: string }[];
    resultsCount: number;
    categoryId?: string;
}

import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/presentation/components/ui/Breadcrumbs";

export function PlacesListView({
    places,
    title = "كل الأماكن",
    categories,
    areas,
    resultsCount,
    categoryId = ""
}: PlacesListViewProps) {
    return (
        <div className="min-h-screen bg-background relative" dir="rtl">
            {/* Ambient Background Accents */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

            {/* Standardized Breadcrumbs - Sticky */}
            <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 py-3">
                <div className="container mx-auto px-4">
                    <Breadcrumbs
                        items={[
                            { label: 'كل الأماكن' }
                        ]}
                    />
                </div>
            </div>

            {/* Premium Integrated Hero Section */}
            <div className="relative pt-16 pb-12 md:pb-20 overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-8">
                        {/* Elegant Icon Container */}
                        <div className={cn(
                            "w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] bg-card p-0.5 shadow-2xl border border-border relative group transition-transform duration-500 hover:scale-105",
                            "after:absolute after:inset-0 after:rounded-[2.5rem] after:bg-primary/5 after:blur-xl after:-z-10"
                        )}>
                            <div className="w-full h-full rounded-[2.4rem] bg-gradient-to-br from-card to-muted flex items-center justify-center overflow-hidden">
                                <MapPin size={64} className="text-primary drop-shadow-sm" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="max-w-3xl space-y-4">
                            <h1 className="text-4xl md:text-7xl font-black text-foreground tracking-tighter">
                                {title} <span className="text-primary italic inline-block">بالسويس</span>
                            </h1>

                            <p className="text-muted-foreground text-lg md:text-2xl font-medium leading-relaxed">
                                اكتشف أفضل الأماكن والخدمات في مدينة السويس. تصفح التقييمات، الصور، وأرقام التواصل.
                            </p>

                            {/* Stats Badge - Unified Style */}
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2 rounded-full border border-primary/20 text-sm font-black uppercase tracking-wider">
                                <MapPin size={16} className="animate-bounce" />
                                <span>{resultsCount} مكان متاح حالياً</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visual Decorative Mesh */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 -z-10" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 -z-10" />
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 pb-20">
                <div className="mb-6">
                    <PlacesFilters categories={categories} areas={areas} resultsCount={resultsCount} />
                </div>

                <div className="mt-8">
                    <PlacesListClient
                        initialPlaces={places}
                        resultsCount={resultsCount}
                        categoryId={categoryId}
                        isCompact={true}
                    />
                </div>
            </div>
        </div>
    );
}

