'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, TrendingUp, Tag } from 'lucide-react'
import { MarketplaceItem } from '@/domain/entities/marketplace-item'
import { getHomeAdsAction } from '@/actions/marketplace.actions'
import { MarketplaceItemCard } from '@/app/(public)/marketplace/components/marketplace-item-card'
import { MarketplaceCardSkeleton } from '@/presentation/components/marketplace/marketplace-card-skeleton'
import { cn } from '@/lib/utils'
import { HorizontalScroll } from '@/presentation/components/shared/ui/horizontal-scroll'

export function LatestAdsSection({ initialItems = [], initialSortType = 'random' }: { initialItems?: MarketplaceItem[], initialSortType?: 'random' | 'most_viewed' | 'lowest_price' }) {
    const [items, setItems] = useState<MarketplaceItem[]>(initialItems)
    const [loading, setLoading] = useState(initialItems.length === 0)
    const [sortType, setSortType] = useState<'random' | 'most_viewed' | 'lowest_price'>(initialSortType)

    useEffect(() => {
        if (initialItems.length > 0) return;

        // Randomly pick a focus logic for this mount
        const types: ('random' | 'most_viewed' | 'lowest_price')[] = ['random', 'most_viewed', 'lowest_price']
        const picked = types[Math.floor(Math.random() * types.length)]
        setSortType(picked)

        const fetchAds = async () => {
            try {
                const ads = await getHomeAdsAction(6, picked)
                setItems(ads)
            } catch (error) {
                console.error('Failed to fetch ads:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchAds()
    }, [])

    if (!loading && items.length === 0) return null

    // Dynamic Titles based on sort
    const getSectionHeader = () => {
        switch (sortType) {
            case 'most_viewed':
                return {
                    title: "الأكثر مشاهدة",
                    subtitle: "المنتجات الأكثر رواجاً وتفاعلاً في مدينتك"
                };
            case 'lowest_price':
                return {
                    title: "أفضل العروض والأسعار",
                    subtitle: "وفر فلوسك مع أفضل الصفقات المتاحة حالياً"
                };
            default:
                // Check if we have featured items in the shuffle
                const hasFeatured = items.some(i => i.is_featured);
                return {
                    title: hasFeatured ? "إعلانات مميزة لك" : "اكتشف جديد السوق اليوم",
                    subtitle: "بيع واشتري كل اللي محتاجه في السويس"
                };
        }
    };

    const header = getSectionHeader();

    return (
        <HorizontalScroll
            className="bg-muted/30"
            title={header.title}
            subtitle={header.subtitle}
            viewAllLink="/marketplace"
        >
            {loading ? (
                [...Array(4)].map((_, i) => (
                    <div key={i} className="w-full">
                        <MarketplaceCardSkeleton />
                    </div>
                ))
            ) : (
                items.map((item) => (
                    <MarketplaceItemCard key={item.id} item={item} isCompact={true} />
                ))
            )}
        </HorizontalScroll>
    )
}
