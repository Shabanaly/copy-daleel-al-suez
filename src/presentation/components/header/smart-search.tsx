'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Search, X, MapPin, Loader2, Calendar, FileText, Store } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useDebounce } from 'use-debounce'
import { motion, AnimatePresence } from 'framer-motion'
import { searchPlacesAndEvents, SearchResult } from '@/actions/search.actions'
import { AreaSelector } from './area-selector'
import { useArea } from '@/contexts/area-context'
import Link from 'next/link'
import Image from 'next/image'

export function SmartSearch({ mobile = false }: { mobile?: boolean }) {
    const [query, setQuery] = useState('')
    const [debouncedQuery] = useDebounce(query, 300)
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false) // For mobile overlay or desktop dropdown

    // Use Global Area Context instead of local state
    const { currentArea } = useArea()

    const router = useRouter()
    const containerRef = useRef<HTMLDivElement>(null)

    // Handle click outside to close dropdown on desktop
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (!mobile) setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [mobile])

    // Close on navigation
    const pathname = usePathname()
    useEffect(() => {
        setIsOpen(false)
        if (mobile) setQuery('')
    }, [pathname, mobile])

    // Perform search
    useEffect(() => {
        const search = async () => {
            if (debouncedQuery.length < 2) {
                setResults([])
                return
            }

            setLoading(true)
            try {
                // Pass the globally selected area ID (if any)
                const data = await searchPlacesAndEvents(debouncedQuery, currentArea?.id)
                setResults(data)

                // Auto-open if we have query
                if (!mobile && debouncedQuery.length >= 2) setIsOpen(true)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        search()
    }, [debouncedQuery, currentArea, mobile])

    const handleResultClick = () => {
        setIsOpen(false)
        if (mobile) setQuery('') // Clear query on mobile close
    }

    // --- Mobile Overlay View ---
    if (mobile) {
        return (
            <>
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 text-foreground/80 hover:text-primary transition-colors"
                >
                    <Search size={24} />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        typeof document !== 'undefined' ? (
                            // Use Portal to render outside header constraints
                            createPortal(
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="fixed inset-0 z-[9999] bg-background flex flex-col"
                                >
                                    {/* Header */}
                                    <div className="flex items-center gap-3 p-4 border-b border-border bg-background">
                                        <Search className="text-muted-foreground" size={20} />
                                        <input
                                            type="text"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder="ابحث عن أماكن، فعاليات، أخبار..."
                                            className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground/50"
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => { setIsOpen(false); setQuery('') }}
                                            className="p-2 bg-accent/50 rounded-full hover:bg-accent transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    {/* Filters */}
                                    <div className="p-4 border-b border-border bg-muted/30">
                                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                                            <AreaSelector />
                                        </div>
                                    </div>

                                    {/* Results */}
                                    <div className="flex-1 overflow-y-auto p-4">
                                        {loading ? (
                                            <div className="flex justify-center py-10">
                                                <Loader2 className="animate-spin text-primary" size={30} />
                                            </div>
                                        ) : query.length > 0 && results.length === 0 ? (
                                            <div className="text-center py-10 text-muted-foreground">
                                                لا توجد نتائج لـ "{query}"
                                            </div>
                                        ) : (
                                            <div className="space-y-4 pb-20">
                                                {results.map((result) => (
                                                    <ResultItem key={result.id} result={result} onClick={handleResultClick} />
                                                ))}
                                            </div>
                                        )}

                                        {query.length === 0 && (
                                            <div className="text-center py-20 opacity-50">
                                                <Search size={48} className="mx-auto mb-4 text-muted-foreground" />
                                                <p>ابدأ الكتابة للبحث...</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>,
                                document.body
                            )
                        ) : null
                    )}
                </AnimatePresence>
            </>
        )
    }

    // --- Desktop Dropdown View ---
    return (
        <div ref={containerRef} className="relative w-full max-w-xl mx-auto hidden md:block group">
            <div className="relative flex items-center bg-muted/50 border border-border focus-within:border-primary/50 focus-within:bg-background focus-within:shadow-lg focus-within:ring-2 focus-within:ring-primary/20 rounded-full transition-all duration-300 overflow-hidden">
                <Search className="mr-4 ml-2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />

                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        if (e.target.value.length >= 2) setIsOpen(true)
                    }}
                    onFocus={() => {
                        if (query.length >= 2) setIsOpen(true)
                    }}
                    placeholder="ابحث عن أماكن، فعاليات، أخبار..."
                    className="flex-1 bg-transparent border-none outline-none py-3 text-sm placeholder:text-muted-foreground/70"
                />

                <div className="pl-1 border-r border-border/50 h-6 mx-2" />

                <div className="pl-1">
                    <AreaSelector />
                </div>
            </div>

            <AnimatePresence>
                {isOpen && query.length >= 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full mt-2 w-full bg-popover/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        {loading ? (
                            <div className="p-8 flex justify-center">
                                <Loader2 className="animate-spin text-primary" />
                            </div>
                        ) : results.length > 0 ? (
                            <div className="max-h-[400px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                {results.map((result) => (
                                    <ResultItem key={result.id} result={result} onClick={handleResultClick} />
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-muted-foreground">
                                لا توجد نتائج مطابقة
                            </div>
                        )}

                        <div className="bg-muted/50 p-2 text-center text-xs text-muted-foreground border-t border-border/50">
                            اضغط Enter للذهاب لصفحة البحث الكاملة
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function ResultItem({ result, onClick }: { result: SearchResult, onClick: () => void }) {
    const getIcon = () => {
        switch (result.type) {
            case 'event': return <Calendar size={16} className="text-orange-500" />
            case 'article': return <FileText size={16} className="text-blue-500" />
            default: return <Store size={16} className="text-green-500" />
        }
    }

    const getLabel = () => {
        switch (result.type) {
            case 'event': return 'فعالية'
            case 'article': return 'خبر'
            default: return 'مكان'
        }
    }

    return (
        <Link
            href={result.slug}
            onClick={onClick}
            className="flex items-start gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors group cursor-pointer"
        >
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                {result.image ? (
                    <Image src={result.image} alt={result.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                        {getIcon()}
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{result.title}</h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-1">
                        {getIcon()}
                        {getLabel()}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{result.description}</p>
                {/* Extra Meta */}
                {result.rating && (
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs font-bold text-amber-500">★ {result.rating.toFixed(1)}</span>
                    </div>
                )}
                {result.date && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(result.date).toLocaleDateString('ar-EG')}
                    </p>
                )}
            </div>
        </Link>
    )
}
