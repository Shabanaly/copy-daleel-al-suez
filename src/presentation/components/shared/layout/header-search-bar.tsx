'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, MapPin, X, Loader2, ChevronDown, Calendar, FileText, Store, ChevronRight, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { useDebounce } from 'use-debounce'
import { cn } from '@/lib/utils'
import { getAreasAction } from '@/actions/area.actions'
import { searchPlacesAndEvents, SearchResult } from '@/actions/search.actions'
import { saveSearchQuery, getSearchHistory, deleteSearchItem, SearchHistoryItem } from '@/actions/search-history.actions'
import { Area } from '@/domain/entities/area'
import Image from 'next/image'

import { useArea } from '@/contexts/area-context'
export function HeaderSearchBar({
    initialMobileFocus = false,
    onClose,
    containerClassName,
    variant = 'default'
}: {
    initialMobileFocus?: boolean;
    onClose?: () => void;
    containerClassName?: string;
    variant?: 'default' | 'ghost';
}) {
    const router = useRouter()
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [query, setQuery] = useState('')
    const [debouncedQuery] = useDebounce(query, 300)

    // Use Global Area Context
    const { areas, currentArea, setCurrentArea } = useArea()
    const selectedArea = currentArea?.id || ''


    const [results, setResults] = useState<SearchResult[]>([])
    const [history, setHistory] = useState<SearchHistoryItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [showAreaMenu, setShowAreaMenu] = useState(false)
    const [activeTab, setActiveTab] = useState<'all' | 'place' | 'event' | 'article'>('all')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const searchParamsHook = useSearchParams()

    // Update placeholder
    const placeholder = "ابحث عن أماكن، فعاليات..."

    // Handle initial focus for mobile overlay
    useEffect(() => {
        if (initialMobileFocus) {
            setIsOpen(true)
            // Small timeout to ensure render
            setTimeout(() => {
                inputRef.current?.focus()
            }, 100)
        }
    }, [initialMobileFocus])

    // No need to fetch areas or save to local storage manually anymore
    // AreaContext handles that.

    // Search Effect
    useEffect(() => {
        const performSearch = async () => {
            if (debouncedQuery.length < 2) {
                setResults([])
                return
            }

            setIsLoading(true)
            try {
                const data = await searchPlacesAndEvents(debouncedQuery, selectedArea || undefined)
                setResults(data)
            } catch (error) {
                console.error("Search failed", error)
            } finally {
                setIsLoading(false)
            }
        }

        performSearch()
    }, [debouncedQuery, selectedArea])

    // Filtering logic for dropdown tabs
    const filteredResults = useMemo(() => {
        if (activeTab === 'all') return results
        return results.filter(r => r.type === activeTab)
    }, [results, activeTab])

    const counts = useMemo(() => {
        return {
            all: results.length,
            place: results.filter(r => r.type === 'place').length,
            event: results.filter(r => r.type === 'event').length,
            article: results.filter(r => r.type === 'article').length,
            question: results.filter(r => r.type === 'question').length
        }
    }, [results])

    // Click Outside Close
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

    // Handle Mobile Back Button (Smart Close)
    useEffect(() => {
        const isMobile = window.innerWidth < 768
        if (!isMobile) return

        if (isOpen) {
            window.history.pushState({ searchOpen: true }, '')
            const handlePopState = () => {
                setIsOpen(false)
                if (onClose) onClose()
            }
            window.addEventListener('popstate', handlePopState)
            return () => {
                window.removeEventListener('popstate', handlePopState)
            }
        }
    }, [isOpen, onClose])

    const fetchHistory = async () => {
        try {
            // 1. Get from Server
            const serverData = await getSearchHistory('global')

            // 2. Get from LocalStorage (for guests)
            const localHistory = JSON.parse(localStorage.getItem('global_history') || '[]')

            // 3. Merge and deduplicate
            const combined = [...serverData]

            localHistory.forEach((query: string) => {
                const exists = combined.some(item => item.query.toLowerCase() === query.toLowerCase())
                if (!exists) {
                    combined.push({
                        id: `local-${Math.random()}`,
                        query,
                        scope: 'global',
                        filters: {},
                        created_at: new Date().toISOString()
                    })
                }
            })

            setHistory(combined.slice(0, 5))
        } catch (error) {
            console.error('History fetch failed:', error)
        }
    }

    const performSearch = async (searchTerm: string) => {
        if (searchTerm.trim()) {
            console.log('[HeaderSearch] performSearch:', searchTerm)
            setIsOpen(false)

            try {
                // 1. Save to Server (if logged in)
                await saveSearchQuery(searchTerm, 'global', { area: selectedArea })
            } catch (err) {
                console.error('[HeaderSearch] saveSearchQuery Error:', err)
            }

            // 2. Save to LocalStorage (Always)
            const localHistory = JSON.parse(localStorage.getItem('global_history') || '[]')
            const updatedLocal = [searchTerm.trim(), ...localHistory.filter((q: string) => q !== searchTerm.trim())].slice(0, 10)
            localStorage.setItem('global_history', JSON.stringify(updatedLocal))

            const params = new URLSearchParams()
            params.set('search', searchTerm)
            if (selectedArea) params.set('area', selectedArea)
            router.push(`/search?${params.toString()}`)
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
        setActiveTab('all')
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
                const localHistory = JSON.parse(localStorage.getItem('global_history') || '[]')
                const updated = localHistory.filter((q: string) => q !== queryText)
                localStorage.setItem('global_history', JSON.stringify(updated))
            } catch (err) {
                console.error('[HeaderSearch] LocalStorage delete failed', err)
            }
        }

        // 3. Server update
        if (!id.startsWith('local-')) {
            try {
                await deleteSearchItem(id, queryText)
            } catch (error) {
                console.error('[HeaderSearch] Server delete failed', error)
            }
        }
    }

    const handleHistoryClick = async (item: string) => {
        console.log('[HeaderSearch] History item clicked:', item)
        setQuery(item)
        await performSearch(item)
    }

    const handleResultClick = async (title: string) => {
        console.log('[HeaderSearch] Result clicked, recording history:', title)
        // Record as a search query
        await saveSearchQuery(title, 'global', { area: selectedArea })

        const localHistoryRaw = localStorage.getItem('global_history') || '[]'
        const localHistory = JSON.parse(localHistoryRaw)
        const updatedLocal = [title.trim(), ...localHistory.filter((q: string) => q !== title.trim())].slice(0, 10)
        localStorage.setItem('global_history', JSON.stringify(updatedLocal))

        setIsOpen(false)
        if (onClose) onClose()
    }

    // Create search params for "View All" link
    const linkParams = new URLSearchParams()
    if (query) linkParams.set('search', query)
    if (selectedArea) linkParams.set('area', selectedArea)

    return (
        <div ref={containerRef} className={cn("relative w-full max-w-lg mx-auto", containerClassName)}>
            <form onSubmit={handleSearchSubmit} className={cn(
                "w-full max-w-full box-border relative flex items-center transition-all duration-300 rounded-full",
                variant === 'default' && "bg-muted/40 border border-border/60 focus-within:bg-background focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 hover:bg-muted/60 hover:border-primary/30",
                variant === 'ghost' && "bg-transparent border-none focus-within:bg-transparent",
                showAreaMenu ? "z-[120]" : "z-[60]"
            )}>

                {/* Back Button (Mobile Only) */}
                {initialMobileFocus && (
                    <button
                        type="button"
                        onClick={() => {
                            if (onClose) onClose()
                            else setIsOpen(false)
                        }}
                        className="p-2 text-muted-foreground hover:text-foreground md:hidden shrink-0"
                    >
                        <ChevronRight size={20} />
                    </button>
                )}

                {/* Area Selector Trigger (Global Only) */}
                <div className="relative border-e border-border/50 pe-1 shrink-0">
                    <button
                        type="button"
                        onClick={() => setShowAreaMenu(!showAreaMenu)}
                        className={cn(
                            "flex items-center gap-1 px-1.5 py-1.5 text-xs font-medium transition-colors",
                            variant === 'ghost' ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {/* Only render content after mount to avoid hydration mismatch with local storage */}
                        {mounted ? (
                            <>
                                <MapPin size={14} className={selectedArea ? "text-primary" : ""} />
                                <span className="max-w-[70px] truncate hidden md:inline-block">
                                    {selectedArea
                                        ? areas.find((a) => a.id === selectedArea)?.name
                                        : "كل المناطق"}
                                </span>
                            </>
                        ) : (
                            <>
                                <MapPin size={14} />
                                <span className="max-w-[70px] truncate hidden md:inline-block">
                                    كل المناطق
                                </span>
                            </>
                        )}
                        <ChevronDown size={12} className="opacity-50" />
                    </button>

                    {/* Area Dropdown Menu */}
                    {showAreaMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-[125] bg-transparent"
                                onClick={() => setShowAreaMenu(false)}
                            />
                            <div className="absolute top-full right-0 mt-2 w-56 bg-popover text-foreground border border-border rounded-xl shadow-lg overflow-hidden z-[130] animate-in fade-in slide-in-from-top-1">
                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCurrentArea(null)
                                            setShowAreaMenu(false)
                                        }}
                                        className={cn(
                                            "w-full text-right px-3 py-2 text-xs hover:bg-muted transition-colors flex items-center justify-between",
                                            !currentArea && "font-bold text-primary"
                                        )}
                                    >
                                        <span>كل المناطق</span>
                                        {!currentArea && <MapPin size={12} />}
                                    </button>
                                    {areas.map((area) => (
                                        <button
                                            key={area.id}
                                            type="button"
                                            onClick={() => {
                                                setCurrentArea(area)
                                                setShowAreaMenu(false)
                                            }}
                                            className={cn(
                                                "w-full text-right px-3 py-2 text-xs hover:bg-muted transition-colors flex items-center justify-between",
                                                currentArea?.id === area.id && "font-bold text-primary"
                                            )}
                                        >
                                            <span>{area.name}</span>
                                            {currentArea?.id === area.id && <MapPin size={12} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Search Input */}
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
                    className={cn(
                        "flex-1 min-w-0 bg-transparent border-none outline-none text-xs md:text-sm ps-2.5 pe-1 py-2",
                        variant === 'ghost' ? "placeholder:text-white/60 text-white" : "placeholder:text-muted-foreground/70 text-foreground"
                    )}
                />

                {/* Actions */}
                <div className="flex items-center pe-1.5 ps-0.5 gap-2 shrink-0">
                    {/* Clear Button (if query exists) */}
                    {isLoading ? (
                        <Loader2 size={16} className="text-muted-foreground animate-spin" />
                    ) : query ? (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-background/50"
                        >
                            <X size={16} />
                        </button>
                    ) : null}

                    {/* Search Icon */}
                    <button
                        type="submit"
                        className={cn(
                            "p-1.5 rounded-full transition-colors",
                            query
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : variant === 'ghost'
                                    ? "bg-transparent text-white/70 hover:bg-white/10"
                                    : "bg-transparent text-muted-foreground hover:bg-muted"
                        )}
                    >
                        <Search size={18} />
                    </button>
                </div>
            </form>



            {/* Search Results Overlay / Dropdown */}
            {
                isOpen && (
                    <>
                        {/* --- Mobile Results --- */}
                        <div className={cn(
                            "md:hidden animate-in fade-in slide-in-from-top-1 z-[110] text-foreground",
                            initialMobileFocus
                                ? "relative flex-1 overflow-hidden pointer-events-auto h-full" // Header Modal Mode
                                : "absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-2xl shadow-xl overflow-hidden" // Hero Inline Mode
                        )}>
                            {query.length < 2 && (
                                <div className="p-4 flex flex-col">
                                    {history && history.length > 0 && (
                                        <div className="mb-6 animate-in slide-in-from-top-2">
                                            <div className="px-3 py-2 flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                <span>نتائج البحث الأخيرة</span>
                                            </div>
                                            <div className="space-y-1">
                                                {history.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center justify-between px-3 py-3.5 bg-muted/30 active:bg-muted rounded-2xl group transition-all"
                                                        onClick={() => handleHistoryClick(item.query)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-border">
                                                                <Search size={14} className="text-muted-foreground" />
                                                            </div>
                                                            <span className="text-sm font-bold">{item.query}</span>
                                                        </div>
                                                        <button
                                                            onClick={(e) => handleDeleteHistory(e, item.id, item.query)}
                                                            className="p-2 hover:bg-muted-foreground/10 rounded-full transition-all"
                                                        >
                                                            <X size={16} className="text-muted-foreground" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="h-px bg-border/50 my-4 mx-3" />
                                        </div>
                                    )}

                                    <div className="text-center text-muted-foreground py-10">
                                        <div className="bg-muted p-4 rounded-full mb-4 w-fit mx-auto">
                                            <Search size={32} className="opacity-40" />
                                        </div>
                                        <h3 className="font-bold text-foreground mb-1">ابحث في السويس</h3>
                                        <p className="text-sm max-w-xs mx-auto">اكتب اسم مطعم، كافيه، أو فعالية...</p>
                                    </div>
                                </div>
                            )}

                            {isLoading && query.length >= 2 && (
                                <div className="p-12 flex flex-col items-center justify-center text-muted-foreground min-h-[50vh]">
                                    <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
                                    <p className="text-sm font-medium">جاري البحث...</p>
                                </div>
                            )}

                            {!isLoading && query.length >= 2 && (
                                <div className="flex flex-col h-full">
                                    {results.length > 0 && (
                                        <div className="px-3 py-2.5 bg-muted/30 border-b border-border flex items-center gap-2 overflow-x-auto scrollbar-hide shrink-0">
                                            {/* @ts-ignore */}
                                            <DropdownTab label="الكل" active={activeTab === 'all'} onClick={() => setActiveTab('all')} count={counts.all} />
                                            {/* @ts-ignore */}
                                            <DropdownTab label="أماكن" active={activeTab === 'place'} onClick={() => setActiveTab('place')} count={counts.place} icon={<Store size={12} />} />
                                            {/* @ts-ignore */}
                                            <DropdownTab label="فعاليات" active={activeTab === 'event'} onClick={() => setActiveTab('event')} count={counts.event} icon={<Calendar size={12} />} />
                                            {/* @ts-ignore */}
                                            <DropdownTab label="المجتمع" active={activeTab === 'question'} onClick={() => setActiveTab('question')} count={counts.question} icon={<MessageSquare size={12} />} />
                                            {/* @ts-ignore */}
                                            <DropdownTab label="أخبار" active={activeTab === 'article'} onClick={() => setActiveTab('article')} count={counts.article} icon={<FileText size={12} />} />
                                        </div>
                                    )}
                                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-background pb-20">
                                        {query.length < 2 && history && history.length > 0 && (
                                            <div className="p-2 border-b border-border/50">
                                                <div className="px-3 py-2 flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                    <span>عمليات بحث سابقة</span>
                                                    <span className="opacity-50">السجل</span>
                                                </div>
                                                <div className="space-y-1">
                                                    {history.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex items-center justify-between px-3 py-3 hover:bg-muted rounded-xl group cursor-pointer active:bg-muted/80 transition-colors"
                                                            onClick={() => handleHistoryClick(item.query)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <Search size={16} className="text-muted-foreground" />
                                                                <span className="text-sm font-medium">{item.query}</span>
                                                            </div>
                                                            <button
                                                                onClick={(e) => handleDeleteHistory(e, item.id, item.query)}
                                                                className="p-2 hover:bg-muted-foreground/10 rounded-full active:scale-95 transition-all outline-none"
                                                            >
                                                                <X size={16} className="text-muted-foreground" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {filteredResults.length > 0 ? (
                                            <>
                                                {filteredResults.map((result) => (
                                                    <ResultItem key={result.id} result={result} onClick={() => handleResultClick(result.title)} />
                                                ))}
                                                <Link
                                                    href={`/search?${linkParams.toString()}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="block p-4 text-center text-sm font-bold text-primary hover:bg-primary/5 transition-colors border-t border-border sticky bottom-0 bg-background/95 backdrop-blur-sm"
                                                >
                                                    عرض كل النتائج ({results.length})
                                                </Link>
                                            </>
                                        ) : query.length >= 2 ? (
                                            <div className="p-12 text-center text-muted-foreground">
                                                <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                <p className="text-base font-medium">لا توجد نتائج</p>
                                            </div>
                                        ) : history.length === 0 && (
                                            <div className="p-12 text-center text-muted-foreground">
                                                <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                <p className="text-sm">اكتب ما تبحث عنه في السويس...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* --- Desktop Results Dropdown --- */}
                        <div className="hidden md:block absolute top-full left-0 right-0 mt-2 bg-popover text-foreground border border-border rounded-2xl shadow-xl overflow-hidden z-[110] animate-in fade-in slide-in-from-top-2">
                            {query.length < 2 && (
                                <div className="p-2">
                                    {history && history.length > 0 ? (
                                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                            <div className="px-3 py-2 flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                <span>نتائج البحث الأخيرة</span>
                                                <span className="opacity-50">سجل البحث</span>
                                            </div>
                                            <div className="space-y-0.5">
                                                {history.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center justify-between px-3 py-2 hover:bg-muted rounded-xl group cursor-pointer transition-all duration-200"
                                                        onClick={() => handleHistoryClick(item.query)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                                <Search size={13} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                                            </div>
                                                            <span className="text-sm font-medium">{item.query}</span>
                                                        </div>
                                                        <button
                                                            onClick={(e) => handleDeleteHistory(e, item.id, item.query)}
                                                            className="p-1.5 hover:bg-muted-foreground/10 rounded-full opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                                                            title="حذف من السجل"
                                                        >
                                                            <X size={13} className="text-muted-foreground" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="h-px bg-border/50 my-2 mx-3" />
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-muted-foreground">
                                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Search size={24} className="opacity-20" />
                                            </div>
                                            <p className="text-sm font-medium">ابدأ البحث في السويس...</p>
                                            <p className="text-xs opacity-50 mt-1">أماكن، فعاليات، وعروض حصرية</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {isLoading && query.length >= 2 && (
                                <div className="p-8 flex items-center justify-center text-muted-foreground">
                                    <Loader2 className="w-6 h-6 animate-spin mb-2" />
                                </div>
                            )}

                            {!isLoading && query.length >= 2 && (
                                <>
                                    {results.length > 0 && (
                                        <div className="px-2 py-2 bg-muted/30 border-b border-border flex items-center gap-1">
                                            {/* @ts-ignore */}
                                            <DropdownTab label="الكل" active={activeTab === 'all'} onClick={() => setActiveTab('all')} count={counts.all} />
                                            {/* @ts-ignore */}
                                            <DropdownTab label="أماكن" active={activeTab === 'place'} onClick={() => setActiveTab('place')} count={counts.place} icon={<Store size={12} />} />
                                            {/* @ts-ignore */}
                                            <DropdownTab label="فعاليات" active={activeTab === 'event'} onClick={() => setActiveTab('event')} count={counts.event} icon={<Calendar size={12} />} />
                                            {/* @ts-ignore */}
                                            <DropdownTab label="المجتمع" active={activeTab === 'question'} onClick={() => setActiveTab('question')} count={counts.question} icon={<MessageSquare size={12} />} />
                                            {/* @ts-ignore */}
                                            <DropdownTab label="أخبار" active={activeTab === 'article'} onClick={() => setActiveTab('article')} count={counts.article} icon={<FileText size={12} />} />
                                        </div>
                                    )}
                                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                        {filteredResults.length > 0 ? (
                                            <>
                                                {filteredResults.map((result) => (
                                                    <ResultItem key={result.id} result={result} onClick={() => handleResultClick(result.title)} />
                                                ))}
                                                <Link
                                                    href={`/search?${linkParams.toString()}`}
                                                    onClick={() => performSearch(query)}
                                                    className="block p-3 text-center text-sm font-medium text-primary hover:bg-primary/5 transition-colors border-t border-border sticky bottom-0 bg-popover/95 backdrop-blur-sm"
                                                >
                                                    عرض كل النتائج ({results.length})
                                                </Link>
                                            </>
                                        ) : (
                                            <div className="p-8 text-center text-muted-foreground">
                                                <p className="text-sm">لا توجد نتائج</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )
            }
        </div >
    )
}

function DropdownTab({ label, active, onClick, count, icon }: any) {
    if (count === 0) return null
    return (
        <button
            onClick={(e) => { e.preventDefault(); onClick(); }}
            className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border flex items-center gap-1.5 whitespace-nowrap shrink-0",
                active
                    ? "bg-primary text-primary-foreground border-primary shadow-sm ring-1 ring-primary/20"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:bg-muted"
            )}
        >
            {icon}
            {label}
            <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full", active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground")}>{count}</span>
        </button>
    )
}

function ResultItem({ result, onClick }: { result: SearchResult, onClick: () => void }) {

    const getIcon = () => {
        switch (result.type) {
            case 'event': return <Calendar size={16} className="text-orange-500" />
            case 'article': return <FileText size={16} className="text-blue-500" />
            case 'question': return <MessageSquare size={16} className="text-primary" />
            default: return <Store size={16} className="text-green-500" />
        }
    }

    const getLabel = () => {
        switch (result.type) {
            case 'event': return 'فعالية'
            case 'article': return 'خبر'
            case 'question': return 'سؤال'
            default: return 'مكان'
        }
    }

    return (
        <Link
            href={result.slug}
            onClick={onClick}
            className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0 group active:bg-muted/30"
        >
            <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-muted border border-border">
                {result.image ? (
                    <Image
                        src={result.image}
                        alt={result.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                        {getIcon()}
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0 text-right">
                <div className="flex items-center justify-between mb-0.5">
                    <h4 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">{result.title}</h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground flex items-center gap-1 shrink-0 ml-2 font-medium">
                        {getLabel()}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground line-clamp-1 opacity-90">{result.description}</p>
                </div>

            </div>

            {/* Rating for places */}
            {result.rating && (
                <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-700 dark:text-amber-500 shrink-0 shadow-sm border border-amber-200/50 dark:border-amber-800/30">
                    <span>⭐</span>
                    <span>{result.rating.toFixed(1)}</span>
                </div>
            )}
        </Link>
    )
}
