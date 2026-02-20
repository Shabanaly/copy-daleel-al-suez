'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Store } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORY_ICONS } from '@/lib/constants/marketplace';
import { MARKETPLACE_FORMS } from '@/config/marketplace-forms';
import { MarketplaceMegaMenu } from './marketplace-mega-menu';

export function MarketplaceCategoriesTabs() {
    const searchParams = useSearchParams()
    const currentCategory = searchParams.get('category') || 'all'
    const currentSubType = searchParams.get('type')
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const subTypeScrollContainerRef = useRef<HTMLDivElement>(null)

    // Get categories from static config, sorted by sortOrder
    const categories = [
        { id: 'all', label: 'الكل', icon: 'Store', sortOrder: 0 },
        ...Object.values(MARKETPLACE_FORMS)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(c => ({ ...c, hasSubTypes: !!c.subTypes && Object.keys(c.subTypes).length > 0 }))
    ];

    // Get active category config for sub-types
    const activeCategoryConfig = currentCategory !== 'all' ? MARKETPLACE_FORMS[currentCategory] : null;
    const subTypes = activeCategoryConfig?.subTypes ? Object.keys(activeCategoryConfig.subTypes) : [];

    // Scroll to active tab
    useEffect(() => {
        if (scrollContainerRef.current) {
            const activeTab = scrollContainerRef.current.querySelector('[data-active="true"]') as HTMLElement
            if (activeTab) {
                activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
            }
        }
    }, [currentCategory])

    return (
        <div className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-40 transition-all duration-300 border-b shadow-sm">
            <div className="container mx-auto px-4">

                {/* Desktop Mega Menu (Hidden on Mobile) */}
                <div className="hidden md:block py-2">
                    <MarketplaceMegaMenu />
                </div>

                {/* Mobile Scrollable Tabs (Visible only on Mobile) */}
                <div className="md:hidden">
                    <div
                        ref={scrollContainerRef}
                        className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2 -mx-4 px-4 mask-fade-sides"
                    >
                        {/* My Ads Button */}
                        <Link
                            href="/marketplace/my-items"
                            className="flex flex-col items-center gap-1 min-w-[60px] p-1.5 rounded-xl transition-all duration-200 group shrink-0 hover:bg-secondary/10"
                        >
                            <div className="p-1.5 rounded-full transition-colors bg-secondary/20 text-secondary group-hover:bg-secondary/30">
                                <Store size={18} />
                            </div>
                            <span className="text-[10px] font-bold whitespace-nowrap text-secondary">إعلاناتي</span>
                        </Link>

                        {/* Divider */}
                        <div className="w-px h-8 bg-border mx-1 shrink-0" />

                        {categories.map((cat) => {
                            const isActive = currentCategory === cat.id || (currentCategory === 'all' && cat.id === 'all' && !searchParams.has('category'))
                            const href = cat.id === 'all' ? '/marketplace/browse' : `/marketplace/browse?category=${cat.id}`
                            const IconComponent = CATEGORY_ICONS[cat.icon] || CATEGORY_ICONS['Store'];

                            return (
                                <Link
                                    key={cat.id}
                                    href={href}
                                    data-active={isActive}
                                    className={cn(
                                        "flex flex-col items-center gap-1 min-w-[64px] p-1.5 rounded-xl transition-all duration-200 group shrink-0",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <div className={cn(
                                        "p-2 rounded-full transition-colors",
                                        isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-muted group-hover:bg-muted-foreground/20 text-muted-foreground group-hover:text-foreground"
                                    )}>
                                        <IconComponent size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold whitespace-nowrap">{cat.label}</span>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Mobile Sub-Type Ribbon (Only if category selected & has sub-types) */}
                    {activeCategoryConfig && subTypes.length > 0 && (
                        <div
                            ref={subTypeScrollContainerRef}
                            className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-3 pt-1 -mx-4 px-4 border-t border-border/50 bg-muted/30"
                        >
                            <Link
                                href={`/marketplace/browse?category=${currentCategory}`}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                                    !currentSubType
                                        ? "bg-primary text-white border-primary"
                                        : "bg-background text-muted-foreground border-border hover:bg-muted"
                                )}
                            >
                                الكل
                            </Link>

                            {subTypes.map((subType) => {
                                const isSelected = currentSubType === subType;
                                return (
                                    <Link
                                        key={subType}
                                        href={`/marketplace/browse?category=${currentCategory}&type=${encodeURIComponent(subType)}`}
                                        className={cn(
                                            "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                                            isSelected
                                                ? "bg-primary text-white border-primary shadow-sm"
                                                : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        {subType}
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
