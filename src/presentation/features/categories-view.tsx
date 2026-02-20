'use client'

import { useState, useTransition } from 'react'
import { Category } from '@/domain/entities/category'
import { PlaceCard } from '@/presentation/features/places/components/place-card'
import { Sparkles, Loader2, Search, X, ChevronRight, ChevronLeft, LayoutGrid, ArrowLeft } from 'lucide-react'
import { getCategoriesWithPlacesAction, CategoryWithPlaces } from '@/app/actions/get-categories-with-places'
import { Button } from '@/presentation/components/ui/Button'
import { HorizontalScroll } from '@/presentation/components/shared/ui/horizontal-scroll'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface CategoriesViewProps {
    initialCategories: CategoryWithPlaces[]
    totalCount: number
}

export function CategoriesView({ initialCategories, totalCount }: CategoriesViewProps) {
    const [categories, setCategories] = useState(initialCategories)
    const [offset, setOffset] = useState(0) // Now tracks the START index of the current page for categories
    const [isPending, startTransition] = useTransition()
    const [searchQuery, setSearchQuery] = useState('')
    const LIMIT = 5 // Show 5 categories per page for better performance

    const loadPage = async (newOffset: number) => {
        if (isPending) return

        startTransition(async () => {
            try {
                const { categories: newCategories } = await getCategoriesWithPlacesAction(newOffset, LIMIT)
                setCategories(newCategories)
                setOffset(newOffset)
                // Scroll to top of categories section
                window.scrollTo({ top: 400, behavior: 'smooth' })
            } catch (error) {
                console.error('Failed to load categories page:', error)
            }
        })
    }

    const handleNext = () => {
        if (offset + LIMIT < totalCount) {
            loadPage(offset + LIMIT)
        }
    }

    const handlePrev = () => {
        if (offset - LIMIT >= 0) {
            loadPage(offset - LIMIT)
        }
    }

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-background relative" dir="rtl">
            {/* Ambient Background Accents */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

            {/* Theme-Adaptive Hero Section (Integrated & Premium) */}
            <div className="pt-32 pb-24 relative overflow-hidden">
                <div className="container mx-auto px-4 text-center relative z-10 space-y-8">
                    <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20 animate-in fade-in slide-in-from-top-4 duration-700">
                        <Sparkles size={16} className="text-primary" />
                        <span className="text-xs font-black text-primary uppercase tracking-widest">
                            دليل السويس • استكشاف ذكي
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-foreground">
                        اكتشف <span className="text-primary italic inline-block">السويس</span>
                    </h1>

                    <p className="text-muted-foreground text-lg md:text-2xl font-medium max-w-2xl mx-auto">
                        كل اللي بتدور عليه متقسم في مكان واحد.. تصفح الأقسام وشوف أحسن الأماكن
                    </p>

                    {/* Unified Premium Search */}
                    <div className="max-w-xl mx-auto relative mt-12 group">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl group-focus-within:bg-primary/30 transition-all rounded-[2.5rem] opacity-40 -z-10" />
                        <div className="relative flex items-center bg-card shadow-sm rounded-[2.5rem] p-1.5 border border-border transition-all duration-500 group-focus-within:border-primary/50 group-focus-within:ring-2 group-focus-within:ring-primary/20 group-focus-within:shadow-xl group-focus-within:shadow-primary/5 overflow-hidden">
                            <div className="flex-1 flex items-center px-6">
                                <Search className="text-muted-foreground mr-3 group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="بتدور على قسم إيه؟ (مثال: مطاعم، صيدليات...)"
                                    className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-foreground font-black placeholder:text-muted-foreground/50 h-11 px-2"
                                />
                            </div>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground ml-2 transition-colors active:scale-95"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Discovery Hub Content */}
            <div className="relative z-20">
                {isPending && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center min-h-[400px]">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <p className="font-bold text-lg animate-pulse">جاري جلب الأقسام بنجاح...</p>
                        </div>
                    </div>
                )}

                {filteredCategories.length > 0 ? (
                    <div className="space-y-4">
                        {filteredCategories.map((category) => (
                            <HorizontalScroll
                                key={category.id}
                                title={category.name}
                                subtitle={`${category.placesCount} مكان متاح في هذا القسم`}
                                viewAllLink={`/categories/${category.slug}`}
                                className="bg-card/30 border-b border-border/40 py-16 md:py-24"
                            >
                                {category.places?.map((place) => (
                                    <PlaceCard key={place.id} place={place} isCompact />
                                ))}
                            </HorizontalScroll>
                        ))}

                        {/* Pagination Controls */}
                        {!searchQuery && (
                            <div className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-border/40">
                                <div className="text-center md:text-right">
                                    <h3 className="text-xl font-black">تصفح مزيد من الأقسام</h3>
                                    <p className="text-muted-foreground font-medium">
                                        عرض {(offset + 1)} - {Math.min(offset + LIMIT, totalCount)} من أصل {totalCount} قسم
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        onClick={handlePrev}
                                        disabled={offset === 0 || isPending}
                                        variant="outline"
                                        className="h-14 px-8 rounded-2xl font-bold flex items-center gap-2 border-2"
                                    >
                                        <ChevronRight size={20} />
                                        السابق
                                    </Button>

                                    <div className="flex gap-1">
                                        {Array.from({ length: Math.ceil(totalCount / LIMIT) }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "w-2 h-2 rounded-full transition-all duration-300",
                                                    Math.floor(offset / LIMIT) === i ? "w-8 bg-primary" : "bg-muted hover:bg-muted-foreground/30"
                                                )}
                                            />
                                        ))}
                                    </div>

                                    <Button
                                        onClick={handleNext}
                                        disabled={offset + LIMIT >= totalCount || isPending}
                                        variant="primary"
                                        className="h-14 px-8 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20"
                                    >
                                        التالي
                                        <ChevronLeft size={20} />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="container mx-auto px-4 py-32 text-center">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted mb-6">
                            <Search size={40} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-3xl font-black mb-4">ملقناش اللى بتدور عليه</h3>
                        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                            جرب تبحث بكلمة تانية أو امسح البحث عشان تشوف كل الأقسام المتاحة حالياً
                        </p>
                        <Button
                            onClick={() => setSearchQuery('')}
                            variant="secondary"
                            className="rounded-full px-12 h-14 font-bold text-lg"
                        >
                            مسح البحث وعرض الكل
                        </Button>
                    </div>
                )}
            </div>

            {/* Sticky Discovery Footer - Quick Access */}
            <div className="container mx-auto px-4 py-12 mb-12 bg-card/50 rounded-[3rem] border border-border/40">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <LayoutGrid size={24} />
                        </div>
                        <div className="text-right">
                            <h4 className="font-bold">استكشاف سريع</h4>
                            <p className="text-xs text-muted-foreground">ألقِ نظرة على كل الأقسام المتاحة في السويس</p>
                        </div>
                    </div>
                    <Link href="/categories/all">
                        <Button variant="ghost" className="font-bold flex items-center gap-2 group">
                            الذهاب إلى الفهرس الكامل
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
