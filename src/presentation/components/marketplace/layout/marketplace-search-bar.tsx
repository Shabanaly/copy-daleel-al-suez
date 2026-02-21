'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Search, MapPin, X, Loader2, ChevronDown, Store, ChevronRight, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { useDebounce } from 'use-debounce'
import { cn } from '@/lib/utils'
import { MARKETPLACE_FORMS } from '@/config/marketplace-forms'
import { getAreasAction } from '@/actions/area.actions'
import { searchMarketplace, MarketplaceSearchResult } from '@/actions/marketplace-search.actions'
import { saveSearchQuery, getSearchHistory, deleteSearchItem, SearchHistoryItem } from '@/actions/search-history.actions'
import { Area } from '@/domain/entities/area'
import Image from 'next/image'

import { useArea } from '@/contexts/area-context'
export function MarketplaceSearchBar({ initialMobileFocus = false, onClose }: { initialMobileFocus?: boolean; onClose?: () => void }) {
    const router = useRouter()
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [query, setQuery] = useState('')
    const [debouncedQuery] = useDebounce(query, 300)

    // Use Global Area Context
    const { areas, currentArea, setCurrentArea } = useArea()
    const selectedArea = currentArea?.id || ''


    const [results, setResults] = useState<MarketplaceSearchResult[]>([])
    const [history, setHistory] = useState<SearchHistoryItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [showAreaMenu, setShowAreaMenu] = useState(false)

    // Context-aware search
    const searchParams = useSearchParams()
    const pathname = usePathname()

    // Close on route change
    const lastPathname = useRef(pathname)
    useEffect(() => {
        if (pathname !== lastPathname.current) {
            setIsOpen(false)
            setShowAreaMenu(false)
            if (onClose) onClose()
            lastPathname.current = pathname
        }
    }, [pathname, onClose])

    const currentCategory = searchParams.get('category')

    // No need to fetch areas or save manually, AreaContext handles it.

    const selectedCategoryName = useMemo(() => {
        if (!currentCategory || currentCategory === 'all') return null
        return MARKETPLACE_FORMS[currentCategory]?.label
    }, [currentCategory])

    // Dynamic placeholder
    const placeholder = useMemo(() => {
        if (selectedCategoryName) return `ابحث في ${selectedCategoryName}...`
        return "ابحث في سوق السويس..."
    }, [selectedCategoryName])
    // Search Logic
    useEffect(() => {
        const performSearch = async () => {
            if (debouncedQuery.length < 2) {
                setResults([])
                return
            }

            setIsLoading(true)
            try {
                // Pass area if selected
                const data = await searchMarketplace(debouncedQuery, selectedArea)
                setResults(data)
            } catch (error) {
                console.error("Marketplace search failed", error)
            } finally {
                setIsLoading(false)
            }
        }
        performSearch()
    }, [debouncedQuery])

    // Mobile Focus
    useEffect(() => {
        if (initialMobileFocus) {
            setIsOpen(true)
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [initialMobileFocus])

    // Click Outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                setShowAreaMenu(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchHistory = async () => {
        console.log('[MarketplaceSearch] fetchHistory start')
        try {
            // 1. Get from Server
            const serverData = await getSearchHistory('marketplace')
            console.log('[MarketplaceSearch] Server History received:', serverData)

            // 2. Get from LocalStorage (for guests or missing DB records)
            const localHistoryRaw = localStorage.getItem('marketplace_history')
            console.log('[MarketplaceSearch] Local History raw:', localHistoryRaw)
            const localHistory = JSON.parse(localHistoryRaw || '[]')

            // 3. Merge and deduplicate
            const combined = [...serverData]

            // Convert local strings to SearchHistoryItem format if needed for guests
            localHistory.forEach((queryText: string) => {
                const exists = combined.some(item => item.query.toLowerCase() === queryText.toLowerCase())
                if (!exists) {
                    combined.push({
                        id: `local-${Math.random()}`,
                        query: queryText,
                        scope: 'marketplace',
                        filters: {},
                        created_at: new Date().toISOString()
                    })
                }
            })

            console.log('[MarketplaceSearch] Combined History:', combined)
            setHistory(combined.slice(0, 5))
        } catch (error) {
            console.error('[MarketplaceSearch] History fetch failed:', error)
        }
    }

    const performSearch = async (searchTerm: string) => {
        if (searchTerm.trim()) {
            console.log('[MarketplaceSearch] performSearch:', searchTerm)
            setIsOpen(false)

            // 1. Save to Server (if logged in)
            await saveSearchQuery(searchTerm, 'marketplace', { category: currentCategory, areaId: selectedArea })

            // 2. Save to LocalStorage (Always)
            const localHistoryRaw = localStorage.getItem('marketplace_history') || '[]'
            const localHistory = JSON.parse(localHistoryRaw)
            const updatedLocal = [searchTerm.trim(), ...localHistory.filter((q: string) => q !== searchTerm.trim())].slice(0, 10)
            localStorage.setItem('marketplace_history', JSON.stringify(updatedLocal))

            const params = new URLSearchParams()
            params.set('search', searchTerm)
            if (currentCategory && currentCategory !== 'all') params.set('category', currentCategory)
            if (selectedArea) params.set('areaId', selectedArea)

            router.push(`/marketplace/search?${params.toString()}`)
            if (onClose) onClose()
        }
    }

    const handleSearchSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await performSearch(query)
    }

    const clearSearch = () => {
        setQuery('')
        setResults([])
        setIsOpen(true)
        fetchHistory()
    }

    const handleDeleteHistory = async (e: React.MouseEvent, id: string, queryText?: string) => {
        e.preventDefault()
        e.stopPropagation()

        // 1. Optimistic UI update
        setHistory(prev => prev.filter(item => item.id !== id))

        // 2. LocalStorage update
        if (queryText) {
            try {
                const localHistory = JSON.parse(localStorage.getItem('marketplace_history') || '[]')
                const updated = localHistory.filter((q: string) => q !== queryText)
                localStorage.setItem('marketplace_history', JSON.stringify(updated))
            } catch (err) {
                console.error('[MarketplaceSearch] LocalStorage delete failed', err)
            }
        }

        // 3. Server update
        if (!id.startsWith('local-')) {
            try {
                await deleteSearchItem(id, queryText)
            } catch (error) {
                console.error('[MarketplaceSearch] Server delete failed', error)
                // Optionally: fetch history again to restore the item if delete failed
                // fetchHistory()
            }
        }
    }

    const handleHistoryClick = async (item: string) => {
        console.log('[MarketplaceSearch] History item clicked:', item)
        setQuery(item)
        await performSearch(item)
    }

    const handleResultClick = async (title: string) => {
        console.log('[MarketplaceSearch] Result clicked, recording history:', title)
        // Record as a search query
        await saveSearchQuery(title, 'marketplace', { category: currentCategory, areaId: selectedArea })

        const localHistoryRaw = localStorage.getItem('marketplace_history') || '[]'
        const localHistory = JSON.parse(localHistoryRaw)
        const updatedLocal = [title.trim(), ...localHistory.filter((q: string) => q !== title.trim())].slice(0, 10)
        localStorage.setItem('marketplace_history', JSON.stringify(updatedLocal))

        if (onClose) onClose()
        setIsOpen(false)
    }

    // Link Params
    const linkParams = new URLSearchParams()
    if (query) linkParams.set('search', query)
    if (currentCategory && currentCategory !== 'all') linkParams.set('category', currentCategory)
    if (selectedArea) linkParams.set('areaId', selectedArea)

    return (
        <div ref={containerRef} className="relative w-full max-w-lg mx-auto">
            <form onSubmit={handleSearchSubmit} className={cn(
                "relative flex items-center bg-muted/50 border border-border/60 rounded-full transition-all duration-300 z-[60]",
                "focus-within:bg-background focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10",
                "hover:bg-muted/80 hover:border-primary/30"
            )}>
                {/* Back Button (Mobile) */}
                {initialMobileFocus && (
                    <button type="button" onClick={() => onClose ? onClose() : setIsOpen(false)} className="p-2 md:hidden shrink-0">
                        <ChevronRight size={20} />
                    </button>
                )}

                {/* Area Selector (New Feature for Marketplace Header) */}
                <div className="relative border-l border-border/50 pl-1 shrink-0">
                    <button
                        type="button"
                        onClick={() => setShowAreaMenu(!showAreaMenu)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <MapPin size={14} className={selectedArea ? "text-primary" : ""} />
                        <span className="max-w-[70px] truncate hidden md:inline-block">
                            {selectedArea ? areas.find(a => a.id === selectedArea)?.name : "كل المناطق"}
                        </span>
                        <ChevronDown size={12} className="opacity-50" />
                    </button>

                    {showAreaMenu && (
                        <>
                            <div className="fixed inset-0 z-[70]" onClick={(e) => { e.stopPropagation(); setShowAreaMenu(false); }} />
                            <div className="absolute top-full right-0 mt-2 w-56 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden z-[80] animate-in fade-in slide-in-from-top-1">
                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                    <button
                                        key="all-areas"
                                        type="button"
                                        onClick={() => { setCurrentArea(null); setShowAreaMenu(false) }}
                                        className={cn("w-full text-right px-4 py-2.5 text-sm hover:bg-muted flex items-center justify-between transition-colors", !currentArea && "text-primary font-bold bg-primary/5")}
                                    >
                                        <span>كل المناطق</span>
                                        {!currentArea && <MapPin size={14} />}
                                    </button>
                                    {areas.map(area => (
                                        <button
                                            key={area.id}
                                            type="button"
                                            onClick={() => { setCurrentArea(area); setShowAreaMenu(false) }}
                                            className={cn("w-full text-right px-4 py-2.5 text-sm hover:bg-muted flex items-center justify-between transition-colors", currentArea?.id === area.id && "text-primary font-bold bg-primary/5")}
                                        >
                                            <span>{area.name}</span>
                                            {currentArea?.id === area.id && <MapPin size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="relative border-l border-border/50 pl-3 shrink-0 text-muted-foreground">
                    <Store size={18} className="text-primary" />
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        setIsOpen(true)
                        fetchHistory()
                    }}
                    placeholder={placeholder}
                    className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm px-3 py-2.5 placeholder:text-muted-foreground/70"
                />

                <div className="flex items-center pl-3 pr-1 gap-1 shrink-0">
                    {isLoading ? <Loader2 size={16} className="animate-spin text-muted-foreground" /> : query && (
                        <button type="button" onClick={clearSearch} className="p-1 hover:bg-background/50 rounded-full">
                            <X size={16} />
                        </button>
                    )}
                    <button type="submit" className={cn("p-1.5 rounded-full", query ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
                        <Search size={18} />
                    </button>
                </div>
            </form>

            {/* Results Overlay */}
            {isOpen && (
                <>
                    <div className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40" onClick={() => window.history.back()} />

                    {/* Mobile Overlay */}
                    <div className="md:hidden fixed top-[72px] left-0 right-0 bottom-0 bg-background border-t z-50 overflow-hidden animate-in fade-in">
                        {renderResultsContent({ query, isLoading, results, history, linkParams, placeholder, setIsOpen, onClose, mode: 'mobile', handleDeleteHistory, handleHistoryClick, performSearch, handleResultClick })}
                    </div>

                    {/* Desktop Dropdown */}
                    <div className="hidden md:block absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in">
                        {renderResultsContent({ query, isLoading, results, history, linkParams, placeholder, setIsOpen, onClose, mode: 'desktop', handleDeleteHistory, handleHistoryClick, performSearch, handleResultClick })}
                    </div>
                </>
            )}
        </div>
    )
}

const CATEGORY_LABELS: Record<string, string> = {
    vehicles: 'سيارات ومركبات',
    real_estate: 'عقارات',
    mobiles: 'موبايلات وتابلت',
    computers: 'كمبيوتر ولابتوب',
    appliances: 'أجهزة منزلية',
    furniture: 'أثاث وديكور',
    fashion: 'ملابس وموضة',
    pets: 'حيوانات أليفة',
    hobbies: 'هوايات وترفيه',
    services: 'خدمات',
    jobs: 'وظائف',
    education: 'تعليم'
};

function renderResultsContent({ query, isLoading, results, history, linkParams, placeholder, setIsOpen, onClose, mode, handleDeleteHistory, handleHistoryClick, performSearch, handleResultClick }: any) {
    const handleClose = () => {
        setIsOpen(false)
        if (onClose) onClose()
    }

    if (query.length < 2) {
        return (
            <div className={cn("flex flex-col", mode === 'mobile' ? "h-full" : "w-full")}>
                {history && history.length > 0 && (
                    <div className="p-2">
                        <div className="px-3 py-2 flex items-center justify-between text-xs font-bold text-muted-foreground">
                            <span>سجل البحث</span>
                            <span className="opacity-50 font-medium whitespace-nowrap">آخر ما بحثت عنه</span>
                        </div>
                        <div className="space-y-1">
                            {history.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between px-3 py-2.5 hover:bg-accent rounded-xl group cursor-pointer transition-colors"
                                    onClick={() => handleHistoryClick(item.query)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Search size={14} className="text-muted-foreground" />
                                        <span className="text-sm font-medium">{item.query}</span>
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteHistory(e, item.id, item.query)}
                                        className="p-1.5 hover:bg-muted-foreground/10 rounded-full opacity-100 md:opacity-0 lg:group-hover:opacity-100 transition-all active:scale-95"
                                    >
                                        <X size={14} className="text-muted-foreground" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="h-px bg-border/50 my-2 mx-3" />
                    </div>
                )}

                <div className={cn("text-center text-muted-foreground", mode === 'mobile' ? "p-10 flex-1 flex flex-col justify-center" : "p-8")}>
                    <ShoppingBag className={cn("mx-auto mb-3 text-muted-foreground/20", mode === 'mobile' ? "w-16 h-16" : "w-10 h-10")} />
                    <p className="text-sm">{placeholder}</p>
                </div>
            </div>
        )
    }
    if (isLoading) {
        return (
            <div className="p-8 flex justify-center text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }
    if (results.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                <p className="text-sm">لا توجد نتائج مطابقة</p>
            </div>
        )
    }
    return (
        <div className={cn("flex flex-col", mode === 'mobile' && "h-full")}>
            <div className={cn("overflow-y-auto custom-scrollbar", mode === 'mobile' ? "flex-1 pb-20" : "max-h-[400px]")}>
                {results.map((result: MarketplaceSearchResult) => (
                    <Link
                        key={result.id}
                        href={result.slug}
                        onClick={() => handleResultClick(result.title)}
                        className="flex items-center gap-3 p-3 hover:bg-muted/50 border-b border-border/50 last:border-0 group"
                    >
                        <div className="relative w-12 h-12 rounded-lg bg-muted border overflow-hidden shrink-0">
                            {result.image ? (
                                <Image src={result.image} alt={result.title} fill className="object-cover group-hover:scale-110 transition-transform" />
                            ) : (
                                <ShoppingBag className="w-6 h-6 m-auto text-muted-foreground" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0 text-right">
                            <h4 className="font-bold text-sm truncate group-hover:text-primary">{result.title}</h4>
                            <div className="flex justify-between items-center text-xs mt-1">
                                <span className="text-muted-foreground">{CATEGORY_LABELS[result.category] || result.category}</span>
                                <span className="font-bold text-primary">{result.price.toLocaleString()} ج.م</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            <Link
                href={`/marketplace/search?${linkParams.toString()}`}
                onClick={() => performSearch(query)}
                className="block p-3 text-center text-sm font-bold text-primary bg-muted/30 hover:bg-primary/5 transition-colors border-t backdrop-blur-sm sticky bottom-0"
            >
                عرض كل المنتجات ({results.length})
            </Link>
        </div>
    )
}
