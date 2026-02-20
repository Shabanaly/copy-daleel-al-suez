import { Place } from "@/domain/entities/place";
import { Category } from "@/domain/entities/category";

import { PlacesListClient } from "@/presentation/features/places/components/places-list-client";
import { CategoryIcon } from "@/presentation/features/categories/components/category-icon";
import { PlacesFilters } from "@/presentation/features/places/components/places-filters";
import { getCategoryColor } from "@/presentation/features/categories/utils/category-colors";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/presentation/components/ui/Breadcrumbs";
import { ViewTracker } from "@/presentation/components/shared/view-tracker";

interface CategoryDetailsViewProps {
    category: Category;
    places: Place[];
    categories: Category[];
    areas: { id: string; name: string }[];
    resultsCount: number;
}

export function CategoryDetailsView({
    category,
    places,
    categories,
    areas,
    resultsCount
}: CategoryDetailsViewProps) {
    const colors = getCategoryColor(category.id);

    return (
        <div className="min-h-screen bg-background relative" dir="rtl">
            {/* Track category views (Client-side execution) */}
            <ViewTracker tableName="categories" id={category.id} />

            {/* Ambient Background Accents */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

            {/* Standardized Breadcrumbs - Sticky */}
            <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 py-3">
                <div className="container mx-auto px-4">
                    <Breadcrumbs
                        items={[
                            { label: 'التصنيفات', href: '/categories' },
                            { label: category.name }
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
                                <CategoryIcon
                                    name={category.icon}
                                    size={64}
                                    className="text-primary drop-shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="max-w-3xl space-y-4">
                            <h1 className="text-4xl md:text-7xl font-black text-foreground tracking-tighter">
                                {category.name} <span className="text-primary italic inline-block">بالسويس</span>
                            </h1>

                            {category.description && (
                                <p className="text-muted-foreground text-lg md:text-2xl font-medium leading-relaxed">
                                    {category.description}
                                </p>
                            )}

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
                <div className="flex flex-col gap-8">
                    {/* Sidebar / Filters (Optional - can be sticky) */}
                    {/* 
                      For now, using the horizontal filters from Places list, 
                      but conceptually this could be a sidebar in the future.
                    */}
                    <div className="flex-1 space-y-8">
                        {/* Filters */}
                        <div className="mb-6">
                            <PlacesFilters
                                categories={categories}
                                areas={areas}
                                hideCategories={true}
                                resultsCount={resultsCount}
                            />
                        </div>

                        {/* Places List */}
                        <PlacesListClient
                            initialPlaces={places}
                            resultsCount={resultsCount}
                            categoryId={category.id}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
