'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { MapPin, Filter, X, ChevronDown, DollarSign, ShoppingBag } from 'lucide-react'
import { getAreasAction } from '@/actions/area.actions'
import { Area } from '@/domain/entities/area'
import { cn } from '@/lib/utils'

interface MarketplaceSearchSidebarProps {
    initialFilters: any
    onApply?: () => void
}

export function MarketplaceSearchSidebar({ initialFilters, onApply }: MarketplaceSearchSidebarProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [areas, setAreas] = useState<Area[]>([])
    const [selectedArea, setSelectedArea] = useState(initialFilters.areaId || '')
    const [minPrice, setMinPrice] = useState(initialFilters.minPrice?.toString() || '')
    const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice?.toString() || '')
    const [listingType, setListingType] = useState(initialFilters.listing_type || '')
    const [ram, setRam] = useState(initialFilters.ram || '')
    const [storage, setStorage] = useState(initialFilters.storage || '')

    useEffect(() => {
        getAreasAction().then(setAreas)
    }, [])

    const handleApply = () => {
        const params = new URLSearchParams(searchParams.toString())

        if (selectedArea) params.set('areaId', selectedArea)
        else params.delete('areaId')

        if (minPrice) params.set('minPrice', minPrice)
        else params.delete('minPrice')

        if (maxPrice) params.set('maxPrice', maxPrice)
        else params.delete('maxPrice')

        if (listingType) params.set('listing_type', listingType)
        else params.delete('listing_type')

        if (ram) params.set('ram', ram)
        else params.delete('ram')

        if (storage) params.set('storage', storage)
        else params.delete('storage')

        router.push(`${pathname}?${params.toString()}`)
        if (onApply) onApply()
    }

    const handleClear = () => {
        setSelectedArea('')
        setMinPrice('')
        setMaxPrice('')
        setListingType('')
        setRam('')
        setStorage('')

        const params = new URLSearchParams(searchParams.toString())
        params.delete('areaId')
        params.delete('minPrice')
        params.delete('maxPrice')

        router.push(`${pathname}?${params.toString()}`)
        if (onApply) onApply()
    }

    const hasChanges = selectedArea !== (initialFilters.areaId || '') ||
        minPrice !== (initialFilters.minPrice?.toString() || '') ||
        maxPrice !== (initialFilters.maxPrice?.toString() || '') ||
        listingType !== (initialFilters.listing_type || '') ||
        ram !== (initialFilters.ram || '') ||
        storage !== (initialFilters.storage || '')

    return (
        <div className="space-y-6">
            <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
                <div className="p-6 border-b border-border bg-muted/50 flex items-center justify-between">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                        <Filter size={18} className="text-primary" />
                        تصفية النتائج
                    </h3>
                    {(selectedArea || minPrice || maxPrice) && (
                        <button onClick={handleClear} className="text-xs text-red-500 font-bold hover:underline">
                            مسح الكل
                        </button>
                    )}
                </div>

                <div className="p-6 space-y-8">
                    {/* Area Filter */}
                    <div>
                        <label className="block text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                            <MapPin size={16} className="text-primary" />
                            المنطقة
                        </label>
                        <div className="relative group">
                            <select
                                value={selectedArea}
                                onChange={(e) => setSelectedArea(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-2xl text-sm appearance-none focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-foreground"
                            >
                                <option value="" className="bg-card">كل المناطق</option>
                                {areas.map(area => (
                                    <option key={area.id} value={area.id} className="bg-card text-foreground">{area.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors" />
                            <MapPin size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>

                    {/* Listing Type Filter */}
                    <div>
                        <label className="block text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                            <ShoppingBag size={16} className="text-primary" />
                            نوع الإعلان
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setListingType(listingType === 'offered' ? '' : 'offered')}
                                className={cn(
                                    "flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all",
                                    listingType === 'offered' ? "bg-primary/10 border-primary text-primary" : "bg-muted border-border text-muted-foreground"
                                )}
                            >
                                معروض
                            </button>
                            <button
                                onClick={() => setListingType(listingType === 'wanted' ? '' : 'wanted')}
                                className={cn(
                                    "flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all",
                                    listingType === 'wanted' ? "bg-orange-500/10 border-orange-500 text-orange-600" : "bg-muted border-border text-muted-foreground"
                                )}
                            >
                                مطلوب
                            </button>
                        </div>
                    </div>

                    {/* Category Specific Filters (e.g., RAM/Storage for Electronics) */}
                    {(initialFilters.category === 'mobiles' || initialFilters.category === 'laptops') && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-3 text-xs">الرامات</label>
                                <select
                                    value={ram}
                                    onChange={(e) => setRam(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-xs outline-none focus:border-primary transition-all text-foreground"
                                >
                                    <option value="" className="bg-card">الكل</option>
                                    {["4GB", "8GB", "16GB", "32GB"].map(opt => (
                                        <option key={opt} value={opt} className="bg-card">{opt}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-3 text-xs">المساحة</label>
                                <select
                                    value={storage}
                                    onChange={(e) => setStorage(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-xs outline-none focus:border-primary transition-all text-foreground"
                                >
                                    <option value="" className="bg-card">الكل</option>
                                    {["128GB", "256GB", "512GB", "1TB"].map(opt => (
                                        <option key={opt} value={opt} className="bg-card">{opt}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {/* Price Filter */}
                    <div>
                        <label className="block text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                            <DollarSign size={16} className="text-primary" />
                            نطاق السعر
                        </label>
                        <div className="space-y-3">
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="من"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="w-full px-4 py-3 bg-muted border border-border rounded-2xl text-sm focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-foreground placeholder:text-muted-foreground/50"
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">ج.م</span>
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="إلى"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="w-full px-4 py-3 bg-muted border border-border rounded-2xl text-sm focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-foreground placeholder:text-muted-foreground/50"
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">ج.م</span>
                            </div>
                        </div>
                    </div>

                    {/* Apply Button */}
                    <button
                        onClick={handleApply}
                        disabled={!hasChanges}
                        className={cn(
                            "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
                            hasChanges
                                ? "bg-primary text-white hover:bg-primary/90 shadow-primary/20 active:scale-[0.98]"
                                : "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
                        )}
                    >
                        <Filter size={18} />
                        تطبيق الفلاتر
                    </button>
                </div>
            </div>

            {/* Support Widget / Tip */}
            <div className="bg-primary/10 rounded-3xl p-6 border border-primary/20">
                <h4 className="font-bold text-primary mb-2 flex items-center gap-2 text-sm">
                    <ShoppingBag size={16} />
                    نصيحة للبائعين والمشترين
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    استخدم فلاتر البحث والمنطقة للوصول لأفضل العروض بالقرب منك. دليل السويس يضمن لك تجربة تسوق آمنة وسريعة.
                </p>
            </div>
        </div>
    )
}
