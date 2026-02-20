import {
    getDiscoverItems,
    getFreshItems,
    getPopularNearbyItems,
    getRecentlyViewedItems,
    getGoodAsNewItems,
    getItemsByCategory
} from '@/actions/marketplace-home.actions'

import { getRecommendedItems } from '@/actions/marketplace-search.actions'
import { MARKETPLACE_FORMS } from "@/config/marketplace-forms";

import {
    CategoriesGridSection,
    ContinueBrowsingSection,
    DiscoverSection,
    FreshItemsSection,
    GuestRecommendationsSection,
    PopularNearbySection,
    SmartCategorySection,
    GoodAsNewSection, // Added
    RelatedTypeSection
} from '@/presentation/components/marketplace/home-sections'

import { MarketplaceItemCard } from './components/marketplace-item-card';
import Link from 'next/link';
import { MarketplaceItem } from '@/domain/entities/marketplace-item';
import { ArrowLeft, Store, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'سوق السويس — بيع واشتري في السويس | دليل السويس',
    description: 'سوق السويس الإلكتروني: اكتشف أفضل العروض في السيارات، العقارات، الموبايلات، والأثاث.',
};

export const revalidate = 60; // ISR

export default async function MarketplacePage() {
    // Select a random category for the SmartCategorySection fallback to keep things fresh
    const categories = Object.keys(MARKETPLACE_FORMS)
    const randomCategoryId = categories[Math.floor(Math.random() * categories.length)]
    const randomCategoryLabel = MARKETPLACE_FORMS[randomCategoryId].label

    // Parallel Fetching
    const [
        discoverItems,
        recentItems,
        popularItems,
        freshItems,
        recommendedItems,
        goodAsNewItems,
        smartFallbackItems // For smart category fallback
    ] = await Promise.all([
        getDiscoverItems(),
        getRecentlyViewedItems(),
        getPopularNearbyItems(),
        getFreshItems(),
        getRecommendedItems(),
        getGoodAsNewItems(),
        getItemsByCategory(randomCategoryId)
    ]);

    return (
        <div className="container mx-auto px-4 py-6 pb-24 space-y-10">
            {/* Header Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-foreground mb-1">سوق السويس</h1>
                    <p className="text-sm text-muted-foreground">بيع واشتري كل اللي محتاجه بسهولة</p>
                </div>
                <Link
                    href="/marketplace/my-items"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary font-bold hover:bg-secondary/20 transition-colors"
                    aria-label="إعلاناتي"
                >
                    <Store size={20} />
                    <span>إعلاناتي</span>
                </Link>
            </div>

            {/* 1. Discover / Trending */}
            <DiscoverSection items={discoverItems} />

            {/* 2. Smart Category (Dynamic Client-Side) */}
            <SmartCategorySection
                fallbackItems={smartFallbackItems}
                fallbackLabel={randomCategoryLabel}
            />

            {/* 3. Continue Browsing (Logged In) */}
            <ContinueBrowsingSection items={recentItems} />

            {/* 4. Good As New (Condition: New/Like New) */}
            <GoodAsNewSection items={goodAsNewItems} />

            {/* 5. Popular Near You */}
            <PopularNearbySection items={popularItems} />

            {/* 6. Related Type (See Also) - Replaces Hourly Spotlight */}
            <RelatedTypeSection fallbackItems={discoverItems.slice(0, 4)} fallbackTitle="عروض أخرى" />

            {/* 7. Fresh & New */}
            <FreshItemsSection items={freshItems} />

            {/* 5. Categories (Entry Point) */}
            <CategoriesGridSection />

            {/* 6. Recommended For You (Deep Personalization - Logged In) OR Guest Recommendations */}
            {recommendedItems.length > 0 ? (
                <section className="py-2">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0">
                                {/* Using Sparkles here as a placeholder for 'Special' or 'User' */}
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold">ترشيحات لك</h2>
                        </div>
                    </div>
                    <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-4 -mx-4 px-4 scrollbar-hide">
                        {recommendedItems.map((item: MarketplaceItem) => (
                            <div key={item.id} className="w-[180px] md:w-[260px] snap-center shrink-0">
                                <MarketplaceItemCard item={item} />
                            </div>
                        ))}
                    </div>
                </section>
            ) : (
                <GuestRecommendationsSection />
            )}

            {/* CTA */}
            <div className="flex justify-center pt-8">
                <Link
                    href="/marketplace/browse"
                    className="group flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-full font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                >
                    <span>تصفح كل الإعلانات</span>
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
}
