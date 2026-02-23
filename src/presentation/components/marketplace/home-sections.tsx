'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { actionFetcher } from '@/lib/swr-fetcher'
import Link from 'next/link'
import { ArrowLeft, Clock, MapPin, Sparkles, Zap, User, Wallet, Star } from 'lucide-react'
import { MarketplaceItem } from '@/domain/entities/marketplace-item'
import { MarketplaceItemCard } from '@/app/(public)/marketplace/components/marketplace-item-card'
import { getGuestRecommendations, getItemsByCategory, getRelatedTypeItems, getNearbyItemsOptimized, getPopularNearbyItems } from '@/actions/marketplace-home.actions'
import { getFromLocalStorage, VIEWED_ITEMS_KEY, VIEWED_CATEGORIES_KEY, VIEWED_SUBTYPES_KEY } from '@/presentation/components/marketplace/guest-tracker'
import { useArea } from '@/contexts/area-context'
import { MarketplaceCardSkeleton } from './marketplace-card-skeleton'

import { CATEGORY_ICONS } from '@/lib/constants/marketplace'
import { MARKETPLACE_FORMS } from '@/config/marketplace-forms'

interface SectionProps {
    title: string
    icon?: React.ElementType
    items: MarketplaceItem[]
    link?: string
    linkText?: string
    variant?: 'grid' | 'carousel'
}

function SectionHeader({ title, icon: Icon, link, linkText }: Omit<SectionProps, 'items' | 'variant'>) {
    return (
        <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0">
                        <Icon className="w-4 h-4" />
                    </div>
                )}
                <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
            </div>
            {link && (
                <Link href={link} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                    {linkText || 'عرض الكل'}
                    <ArrowLeft className="w-4 h-4" />
                </Link>
            )}
        </div>
    )
}

// 1. Discover Section (Grid)
export function DiscoverSection({ items }: { items: MarketplaceItem[] }) {
    if (!items?.length) return null
    return (
        <section className="py-2">
            <SectionHeader title="الأكثر رواجاً" icon={Zap} link="/marketplace/browse" linkText="تصفح المزيد" />
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-4 -mx-4 px-4 scrollbar-hide">
                {items.map(item => (
                    <div key={item.id} className="w-[180px] md:w-[260px] snap-center shrink-0">
                        <MarketplaceItemCard item={item} />
                    </div>
                ))}
            </div>
        </section>
    )
}

// 2. Continue Browsing (Carousel)
export function ContinueBrowsingSection({ items }: { items: MarketplaceItem[] }) {
    if (!items?.length) return null
    return (
        <section className="py-2 bg-muted/30 -mx-4 px-4 md:mx-0 md:px-0 md:bg-transparent rounded-xl">
            <SectionHeader title="شاهدته مؤخراً" icon={Clock} />
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-4 -mx-4 px-4 scrollbar-hide">
                {items.map(item => (
                    <div key={item.id} className="w-[180px] md:w-[260px] snap-center shrink-0">
                        <MarketplaceItemCard item={item} />
                    </div>
                ))}
            </div>
        </section>
    )
}

// 3. Popular Nearby (Client-Side Dynamic)
export function PopularNearbySection({ items: initialItems }: { items: MarketplaceItem[] }) {
    const { currentArea } = useArea()

    const { data: items = [], isLoading: loading } = useSWR(
        ['nearby-items', currentArea?.id],
        () => getNearbyItemsOptimized(currentArea?.id),
        {
            fallbackData: initialItems,
            revalidateOnFocus: false,
            dedupingInterval: 60000
        }
    )

    if (!loading && items.length === 0) return null

    const title = currentArea ? `عروض في ${currentArea.name} وما حولها` : "عروض بالقرب منك"

    return (
        <section className="py-2">
            <SectionHeader title={title} icon={MapPin} />
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-4 -mx-4 px-4 scrollbar-hide min-h-[200px]">
                {loading ? (
                    // Show skeletons while loading
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="w-[180px] md:w-[260px] shrink-0">
                            <MarketplaceCardSkeleton />
                        </div>
                    ))
                ) : (
                    items.map(item => (
                        <div key={item.id} className="w-[180px] md:w-[260px] snap-center shrink-0">
                            <MarketplaceItemCard item={item} />
                        </div>
                    ))
                )}
            </div>
        </section>
    )
}

// 4. Fresh Items (Grid)
export function FreshItemsSection({ items }: { items: MarketplaceItem[] }) {
    if (!items?.length) return null
    return (
        <section className="py-2">
            <SectionHeader title="أضيف حديثاً" icon={Sparkles} link="/marketplace/browse?sort=newest" />
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-4 -mx-4 px-4 scrollbar-hide">
                {items.map(item => (
                    <div key={item.id} className="w-[180px] md:w-[260px] snap-center shrink-0">
                        <MarketplaceItemCard item={item} />
                    </div>
                ))}
            </div>
        </section>
    )
}

// 5. Categories Grid (Entry Point)
export function CategoriesGridSection() {
    const categories = Object.values(MARKETPLACE_FORMS).sort((a, b) => a.sortOrder - b.sortOrder)

    return (
        <section className="py-2">
            <SectionHeader title="تصفح حسب القسم" />
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {categories.map(cat => {
                    const Icon = CATEGORY_ICONS[cat.icon] || CATEGORY_ICONS['Store']
                    return (
                        <Link
                            key={cat.id}
                            href={`/marketplace/browse?category=${cat.id}`}
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group"
                        >
                            <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                <Icon size={24} />
                            </div>
                            <span className="text-xs font-bold text-center text-foreground group-hover:text-primary transition-colors">{cat.label}</span>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}

// 6. Guest Recommendations (SWR-based)
export function GuestRecommendationsSection() {
    const { data: items = [], isLoading: loading } = useSWR(
        typeof window !== 'undefined' ? ['guest-recommendations', getFromLocalStorage(VIEWED_ITEMS_KEY), getFromLocalStorage(VIEWED_CATEGORIES_KEY)] : null,
        ([, items, cats]) => getGuestRecommendations(items, cats),
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000
        }
    )

    if (loading || items.length === 0) return null

    return (
        <section className="py-2">
            <SectionHeader title="ترشيحات لك" icon={User} />
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-4 -mx-4 px-4 scrollbar-hide">
                {items.map(item => (
                    <div key={item.id} className="w-[180px] md:w-[260px] snap-center shrink-0">
                        <MarketplaceItemCard item={item} />
                    </div>
                ))}
            </div>
        </section>
    )
}

// 7. Smart Category (SWR-based)
export function SmartCategorySection({ fallbackItems, fallbackLabel }: { fallbackItems?: MarketplaceItem[], fallbackLabel?: string }) {
    const { data: smartData, isLoading: loading } = useSWR(
        ['smart-category', typeof window !== 'undefined' ? getFromLocalStorage(VIEWED_CATEGORIES_KEY) : []],
        async ([, categories]) => {
            const targetCategoryId = (categories as string[])?.length > 0 ? (categories as string[])[0] : 'vehicles'
            const config = MARKETPLACE_FORMS[targetCategoryId as keyof typeof MARKETPLACE_FORMS]
            if (!config) return null
            const items = await getItemsByCategory(targetCategoryId)
            return { items, label: config.label, hasHistory: (categories as string[])?.length > 0 }
        },
        {
            fallbackData: fallbackItems ? { items: fallbackItems, label: fallbackLabel || 'مركبات', hasHistory: false } : undefined,
            revalidateOnFocus: false,
            dedupingInterval: 60000
        }
    )

    const items = smartData?.items || []
    const categoryLabel = smartData?.label || ''
    const hasHistory = smartData?.hasHistory || false

    // Maintain structure during loading/empty state to avoid hydration mismatch
    if (items.length === 0) return null

    // Determine title based on context
    const fullTitle = hasHistory
        ? `لأنك مهتم بـ ${categoryLabel}`
        : `عروض مميزة في ${categoryLabel}`

    return (
        <section className="py-2">
            <SectionHeader title={fullTitle} icon={Sparkles} />
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-4 -mx-4 px-4 scrollbar-hide">
                {items.map(item => (
                    <div key={item.id} className="w-[180px] md:w-[260px] snap-center shrink-0">
                        <MarketplaceItemCard item={item} />
                    </div>
                ))}
            </div>
        </section>
    )
}

// 8. Good As New (Condition: new or like_new)
export function GoodAsNewSection({ items }: { items: MarketplaceItem[] }) {
    if (!items?.length) return null
    return (
        <section className="py-2">
            <SectionHeader title="فرص بحالة الزيرو ✨" icon={Sparkles} />
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-4 -mx-4 px-4 scrollbar-hide">
                {items.map(item => (
                    <div key={item.id} className="w-[180px] md:w-[260px] snap-center shrink-0">
                        <MarketplaceItemCard item={item} />
                    </div>
                ))}
            </div>
        </section>
    )
}

// 9. Related Type Section (SWR-based)
export function RelatedTypeSection({ fallbackItems, fallbackTitle }: { fallbackItems?: MarketplaceItem[], fallbackTitle?: string }) {
    const { data: relatedData, isLoading: loading } = useSWR(
        ['related-type-items',
            typeof window !== 'undefined' ? getFromLocalStorage(VIEWED_SUBTYPES_KEY) : [],
            typeof window !== 'undefined' ? getFromLocalStorage(VIEWED_CATEGORIES_KEY) : []
        ],
        async ([, viewedSubtypes, viewedCategories]) => {
            // 1. Try Locked Spotlight
            if (typeof window !== 'undefined') {
                const storedLock = localStorage.getItem('daleel_spotlight_lock')
                if (storedLock) {
                    try {
                        const { categoryId, typeKey, typeValue, typeLabel } = JSON.parse(storedLock)
                        const data = await getRelatedTypeItems(categoryId, typeKey, typeValue)
                        if (data?.length > 0) return { items: data, title: `شاهد أيضاً: ${typeLabel}` }
                    } catch (e) { }
                }
            }

            // 2. Try Subtype History
            if ((viewedSubtypes as any[])?.length > 0) {
                const { categoryId, typeKey, typeValue, typeLabel } = (viewedSubtypes as any[])[0]
                try {
                    const data = await getRelatedTypeItems(categoryId, typeKey, typeValue)
                    if (data?.length > 0) return { items: data, title: `شاهد أيضاً: ${typeLabel}` }
                } catch (e) { }
            }

            // 3. Try Smart Category
            if ((viewedCategories as string[])?.length > 0) {
                const categoryId = (viewedCategories as string[])[0]
                const config = MARKETPLACE_FORMS[categoryId as keyof typeof MARKETPLACE_FORMS]
                if (config) {
                    try {
                        const data = await getItemsByCategory(categoryId)
                        if (data?.length > 0) return { items: data, title: `شاهد أيضاً: ${config.label}` }
                    } catch (e) { }
                }
            }

            // 4. Fallback Default
            try {
                const data = await getItemsByCategory('vehicles')
                return { items: data || [], title: 'شاهد أيضاً: سيارات للبيع' }
            } catch (e) {
                return { items: [], title: '' }
            }
        },
        {
            fallbackData: fallbackItems ? { items: fallbackItems, title: fallbackTitle || 'شاهد أيضاً' } : undefined,
            revalidateOnFocus: false,
            dedupingInterval: 60000
        }
    )

    const items = relatedData?.items || []
    const title = relatedData?.title || ''

    if (items.length === 0) return null

    return (
        <section className="py-2">
            <SectionHeader title={title} icon={Sparkles} />
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-4 -mx-4 px-4 scrollbar-hide">
                {items.map(item => (
                    <div key={item.id} className="w-[180px] md:w-[260px] snap-center shrink-0">
                        <MarketplaceItemCard item={item} />
                    </div>
                ))}
            </div>
        </section>
    )
}
