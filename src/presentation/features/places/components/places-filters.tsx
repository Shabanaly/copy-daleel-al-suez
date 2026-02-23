'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, X, ChevronDown, ListFilter, SortAsc, Check, MapPin, Search } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Category } from '@/domain/entities/category'
import { cn } from '@/lib/utils'
import { MobileFilterDrawer } from './mobile-filter-drawer'
import { Button } from '@/presentation/components/ui/Button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/presentation/components/ui/dropdown-menu"

interface PlacesFiltersProps {
    categories: Category[]
    areas: { id: string; name: string }[]
    hideCategories?: boolean
    resultsCount?: number
}

export function PlacesFilters({ categories, areas, hideCategories = false, resultsCount }: PlacesFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Derived state from URL
    const selectedCategory = searchParams.get('category') || ''
    const selectedAreaId = searchParams.get('area') || ''
    const selectedSort = searchParams.get('sort') || 'recent'
    const searchQuery = searchParams.get('search') || ''

    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [localSearch, setLocalSearch] = useState(searchQuery)

    // Debounce search update
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== searchParams.get('search')) {
                updateFilter('search', localSearch)
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [localSearch])

    const selectedAreaName = areas.find(a => a.id === selectedAreaId)?.name || 'كل المناطق'

    // Update filter helper
    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())

        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }

        // Reset to first page if filtering
        params.delete('cursor')

        router.push(`?${params.toString()}`, { scroll: false })
    }

    const clearFilters = () => {
        router.push(window.location.pathname)
    }

    const hasActiveFilters = selectedCategory || selectedAreaId || (selectedSort && selectedSort !== 'recent') || searchQuery

    const SortOptions = [
        { id: 'recent', label: 'الأحدث' }, // Still internal, but we can hide from main strip if needed
        { id: 'rating', label: 'الأعلى تقييماً' },
        { id: 'name', label: 'الاسم (أ-ي)' }
    ]

    return (
        <div className="sticky top-[104px] z-30 -mx-4 px-4 bg-background/80 backdrop-blur-xl border-y border-border/40 py-4 mb-10 transition-all duration-300">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-4">

                    {/* Left: Results Count (Premium Label) */}
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-2xl border border-primary/10 whitespace-nowrap">
                        <span className="text-xs font-black text-primary uppercase tracking-tighter">النتائج</span>
                        <span className="text-sm font-bold text-foreground">{resultsCount || 0}</span>
                    </div>

                    {/* Middle: Smart Search & Area Strip */}
                    <div className="flex-1 w-full flex items-center gap-2">
                        {/* Integrated Search Input */}
                        <div className="relative flex-1 group">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="text"
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                placeholder="ابحث..."
                                className="w-full bg-muted/40 border border-border/40 group-hover:border-primary/30 focus:border-primary/50 focus:bg-background focus:ring-4 focus:ring-primary/10 h-12 pr-11 pl-4 rounded-[1.25rem] text-sm font-bold transition-all duration-300 outline-none"
                            />
                        </div>

                        {/* Area Dropdown - Unified Desktop & Mobile */}
                        <div className="flex shrink-0">
                            <DropdownMenu dir="rtl">
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="h-12 px-3 md:px-6 rounded-[1.25rem] border-transparent bg-muted/30 hover:bg-background hover:border-primary/20 flex items-center gap-2 md:gap-3 font-bold">
                                        <MapPin size={18} className={selectedAreaId ? "text-primary" : "text-muted-foreground"} />
                                        <span className="max-w-[80px] md:max-w-[120px] truncate hidden xs:inline-block">
                                            {selectedAreaName}
                                        </span>
                                        <ChevronDown size={14} className="opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[280px] max-h-[400px] overflow-y-auto rounded-2xl p-2 shadow-2xl custom-scrollbar border-border/50 bg-background/95 backdrop-blur-xl z-[150]">
                                    <DropdownMenuItem onClick={() => updateFilter('area', '')} className="rounded-xl py-3 px-4 font-bold cursor-pointer hover:bg-primary/5 transition-colors">
                                        كل المناطق
                                    </DropdownMenuItem>
                                    <div className="h-px bg-border/50 my-1 mx-2" />
                                    {areas.map((area) => (
                                        <DropdownMenuItem
                                            key={area.id}
                                            onClick={() => updateFilter('area', area.id)}
                                            className={cn(
                                                "rounded-xl py-3 px-4 font-bold cursor-pointer flex items-center justify-between transition-colors",
                                                selectedAreaId === area.id ? "bg-primary text-white hover:bg-primary/90" : "hover:bg-primary/5"
                                            )}
                                        >
                                            {area.name}
                                            {selectedAreaId === area.id && <Check size={16} className="text-white" />}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Right: Actions (Sort & Mobile Toggle) */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Sort Dropdown */}
                        <DropdownMenu dir="rtl">
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-12 w-12 md:w-auto md:px-5 rounded-[1.25rem] bg-muted/30 flex items-center gap-2 group">
                                    <SortAsc size={18} className="text-muted-foreground group-hover:text-primary" />
                                    <span className="hidden md:inline font-bold">الترتيب</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px] rounded-2xl p-2 shadow-2xl border-border/50 bg-background/95 backdrop-blur-xl z-[150]">
                                {SortOptions.filter(opt => opt.id !== 'recent').map((opt) => (
                                    <DropdownMenuItem
                                        key={opt.id}
                                        onClick={() => updateFilter('sort', opt.id)}
                                        className={cn(
                                            "rounded-xl py-3 font-bold cursor-pointer flex items-center justify-between",
                                            selectedSort === opt.id && "bg-primary/10 text-primary"
                                        )}
                                    >
                                        {opt.label}
                                        {selectedSort === opt.id && <Check size={16} />}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuItem onClick={() => updateFilter('sort', 'recent')} className="rounded-xl py-3 font-bold cursor-pointer text-muted-foreground opacity-70">
                                    الوضع الافتراضي
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Reset All */}
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="h-12 w-12 rounded-[1.25rem] bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-95"
                                title="مسح الفلاتر"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Drawer Integration */}
            <MobileFilterDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                resultsCount={resultsCount}
            >
                <div className="space-y-6 pt-4 pb-10">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-black text-muted-foreground uppercase tracking-wider">اختيار المنطقة</label>
                            {selectedAreaId && (
                                <button onClick={() => updateFilter('area', '')} className="text-xs font-bold text-primary">مسح</button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => updateFilter('area', '')}
                                className={cn(
                                    "px-4 py-4 rounded-2xl text-sm font-bold border transition-all flex items-center justify-center gap-2",
                                    !selectedAreaId ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-muted/50 border-transparent text-muted-foreground hover:border-border"
                                )}
                            >
                                كل المناطق
                            </button>
                            {areas.map(area => (
                                <button
                                    key={area.id}
                                    onClick={() => updateFilter('area', area.id)}
                                    className={cn(
                                        "px-4 py-4 rounded-2xl text-sm font-bold border transition-all flex items-center justify-center gap-2",
                                        selectedAreaId === area.id ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-muted/50 border-transparent text-muted-foreground hover:border-border"
                                    )}
                                >
                                    {area.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </MobileFilterDrawer>
        </div>
    )
}
