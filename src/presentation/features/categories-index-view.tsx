'use client'

import React, { useMemo, useState } from 'react'
import { CategoryIndexItem } from '@/app/actions/get-categories-all'
import { CategoryIcon } from '@/presentation/features/categories/components/category-icon'
import { Search, Hash, LayoutGrid, Clock, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/presentation/components/ui/Button'

interface CategoriesIndexViewProps {
    categories: CategoryIndexItem[]
}

export function CategoriesIndexView({ categories }: CategoriesIndexViewProps) {
    const [searchQuery, setSearchQuery] = useState('')

    // Group categories by first letter
    const groupedCategories = useMemo(() => {
        const filtered = categories.filter(cat =>
            cat.name.toLowerCase().includes(searchQuery.toLowerCase())
        )

        const groups: { [key: string]: CategoryIndexItem[] } = {}

        filtered.forEach(cat => {
            const firstLetter = cat.name.charAt(0).toUpperCase()
            if (!groups[firstLetter]) {
                groups[firstLetter] = []
            }
            groups[firstLetter].push(cat)
        })

        // Sort keys alphabetically
        return Object.keys(groups).sort().reduce((acc, key) => {
            acc[key] = groups[key]
            return acc
        }, {} as { [key: string]: CategoryIndexItem[] })
    }, [categories, searchQuery])

    const alphabet = Object.keys(groupedCategories)

    return (
        <div className="min-h-screen bg-background relative" dir="rtl">
            {/* Ambient Background Accents */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

            {/* Theme-Adaptive Header (Softer & Integrated) */}
            <div className="pt-32 pb-24 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <Link href="/categories" className="inline-flex items-center gap-2 bg-primary/5 text-primary hover:bg-primary/10 px-5 py-2.5 rounded-full border border-primary/20 transition-all duration-300 font-bold group shadow-sm hover:shadow-primary/10">
                            <ArrowRight size={18} className="group-hover:-translate-x-1 transition-transform" />
                            العودة للاستكشاف
                        </Link>

                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-foreground">
                                الفهرس <span className="text-primary italic inline-block">الكامل</span>
                            </h1>
                            <p className="text-muted-foreground text-lg md:text-2xl font-medium max-w-2xl mx-auto">
                                تصفح كل ما في السويس.. دليل شامل ومنظم لجميع الخدمات
                            </p>
                        </div>

                        {/* Direct Search - Integrated Style */}
                        <div className="max-w-xl mx-auto relative mt-12 group">
                            <div className="absolute inset-0 bg-primary/20 blur-3xl group-focus-within:bg-primary/30 transition-all rounded-[2.5rem] opacity-40 -z-10" />
                            <div className="relative flex items-center bg-card shadow-sm rounded-[2.5rem] p-1.5 border border-border transition-all duration-500 group-focus-within:border-primary/50 group-focus-within:ring-2 group-focus-within:ring-primary/20 group-focus-within:shadow-xl group-focus-within:shadow-primary/5 overflow-hidden">
                                <Search className="text-muted-foreground mr-4 group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="ابحث عن قسم معين..."
                                    className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-foreground font-bold placeholder:text-muted-foreground/50 h-11 px-2"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 relative z-10 pb-32">
                {/* Main Content Area - Significant Breathing Room */}
                <div className="space-y-32 mt-12">
                    {Object.entries(groupedCategories).map(([letter, items]) => (
                        <div key={letter} id={`letter-${letter}`} className="scroll-mt-32">
                            <div className="flex items-center gap-6 mb-12">
                                <div className="w-16 h-16 rounded-[1.25rem] bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary text-3xl font-black border border-primary/20 shadow-inner">
                                    {letter}
                                </div>
                                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
                                <span className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">{items.length} قسم</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {items.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/categories/${cat.slug}`}
                                        className="group p-6 rounded-[2rem] bg-card hover:bg-slate-50 dark:hover:bg-primary/5 border border-border/60 hover:border-primary/40 transition-all duration-500 flex items-center gap-5 hover:shadow-xl hover:-translate-y-2"
                                    >
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md transition-all duration-500 group-hover:scale-110",
                                            cat.color || 'bg-primary'
                                        )}>
                                            <CategoryIcon name={cat.icon || null} size={24} />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <h3 className="font-black text-foreground group-hover:text-primary transition-colors text-lg truncate">
                                                {cat.name}
                                            </h3>
                                            <span className="text-[10px] font-bold text-muted-foreground/60 bg-muted/30 px-2 py-1 rounded-full inline-block mt-1">
                                                {cat.placesCount} مكان متاح
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats Footer - Cohesive & Clean */}
            <div className="bg-slate-50 dark:bg-slate-950/50 py-24 border-t border-border/40 relative">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto bg-card rounded-[3rem] p-10 shadow-sm border border-border flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="text-right space-y-2">
                            <div className="flex items-center gap-2 text-primary">
                                <Clock size={18} />
                                <span className="text-xs font-black uppercase tracking-[0.2em]">آخر تحديث</span>
                            </div>
                            <h4 className="text-2xl font-black">بيانات دليل السويس</h4>
                            <p className="text-muted-foreground font-medium">محدثة لحظياً لضمان أفضل تجربة</p>
                        </div>

                        <div className="flex items-baseline gap-4">
                            <p className="text-7xl font-black text-primary">
                                {categories.length}
                            </p>
                            <span className="text-sm font-black text-muted-foreground uppercase tracking-widest">قسم مسجل</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
