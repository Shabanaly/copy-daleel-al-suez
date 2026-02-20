'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MARKETPLACE_FORMS } from '@/config/marketplace-forms';
import { CATEGORY_ICONS } from '@/lib/constants/marketplace';
import { MarketplaceItemForm } from '@/presentation/components/marketplace/marketplace-item-form';

export default function NewMarketplaceItemPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const categoryParam = searchParams.get('category');
    const [visibleCount, setVisibleCount] = useState(10);

    // Get categories from static config, sorted by sortOrder
    const categories = Object.values(MARKETPLACE_FORMS)
        .sort((a, b) => a.sortOrder - b.sortOrder);

    const visibleCategories = categories.slice(0, visibleCount);
    const hasMore = categories.length > visibleCount;
    const remainingCount = categories.length - visibleCount;

    if (!categoryParam) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-xl md:text-2xl font-bold mb-6 text-center text-foreground">ماذا تريد أن تبيع اليوم؟</h1>

                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {visibleCategories.map((cat) => {
                            const IconComponent = CATEGORY_ICONS[cat.icon] || CATEGORY_ICONS['other'];
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => router.push(`/marketplace/new?category=${cat.id}`)}
                                    className="flex md:flex-col items-center gap-4 md:gap-3 p-3 md:p-4 rounded-xl bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/50 hover:bg-accent/50 transition-all group text-right md:text-center w-full"
                                >
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                                        {IconComponent ? <IconComponent size={20} className="md:w-6 md:h-6" /> : <div className="w-5 h-5 bg-transparent rounded" />}
                                    </div>
                                    <span className="font-bold text-sm text-card-foreground group-hover:text-primary transition-colors">{cat.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {hasMore && (
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => setVisibleCount(prev => prev + 10)}
                                className="bg-muted hover:bg-muted/80 text-muted-foreground px-6 py-2 rounded-full text-sm font-bold transition-colors flex items-center gap-2"
                            >
                                <span>عرض المزيد من التصنيفات</span>
                                <span className="bg-foreground/10 text-foreground text-[10px] px-1.5 py-0.5 rounded-full">{remainingCount}+</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const selectedCategory = MARKETPLACE_FORMS[categoryParam];
    if (!selectedCategory) {
        router.push('/marketplace/new');
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8 flex items-center gap-4">
                    <button
                        onClick={() => router.push('/marketplace/new')}
                        className="text-primary font-bold text-sm hover:underline"
                    >
                        ← تغيير القسم
                    </button>
                    <h1 className="text-2xl font-bold text-foreground">تفاصيل الإعلان ({selectedCategory.label})</h1>
                </div>
                <MarketplaceItemForm categoryConfig={selectedCategory} />
            </div>
        </div>
    );
}
