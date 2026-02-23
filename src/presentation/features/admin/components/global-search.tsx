'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, User, ShoppingBag, MapPin, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { adminGlobalSearchAction } from '@/actions/admin-search.actions'
import { useDebounce } from 'use-debounce'
import Link from 'next/link'

export function GlobalAdminSearch() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [debouncedQuery] = useDebounce(query, 300)
    const [results, setResults] = useState<{
        users: any[],
        items: any[],
        places: any[]
    } | null>(null)
    const [loading, setLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const handleSearch = async () => {
            if (!debouncedQuery || debouncedQuery.length < 2) {
                setResults(null)
                return
            }

            setLoading(true)
            const res = await adminGlobalSearchAction(debouncedQuery)
            if (res.success && res.results) {
                setResults(res.results)
            }
            setLoading(false)
        }

        handleSearch()
    }, [debouncedQuery])

    // Close on escape
    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false)
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setIsOpen(true)
            }
        }
        window.addEventListener('keydown', h)
        return () => window.removeEventListener('keydown', h)
    }, [])

    return (
        <div className="relative flex-1 max-w-md">
            <div className="relative group">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setIsOpen(true)
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="بحث سريع... (Ctrl+K)"
                    className="w-full bg-muted/50 border border-border rounded-xl py-2 px-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background transition-all"
                />
                {query && (
                    <button
                        onClick={() => { setQuery(''); setResults(null); }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {isOpen && (query.length >= 2 || loading) && (
                <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-[70vh] overflow-y-auto p-2 space-y-4">
                        {loading && (
                            <div className="flex items-center justify-center py-8 text-primary">
                                <Loader2 className="animate-spin" size={24} />
                            </div>
                        )}

                        {!loading && results && (
                            <>
                                {results.users.length > 0 && (
                                    <section className="space-y-1">
                                        <h4 className="px-3 py-1 text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                            <User size={10} /> المستخدمين
                                        </h4>
                                        {results.users.map(u => (
                                            <Link
                                                key={u.id}
                                                href={`/admin/users?id=${u.id}`}
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted text-sm group"
                                            >
                                                <span>{u.full_name}</span>
                                                <span className="text-[10px] bg-muted group-hover:bg-background transition-colors px-1.5 py-0.5 rounded text-muted-foreground uppercase">{u.role}</span>
                                            </Link>
                                        ))}
                                    </section>
                                )}

                                {results.items.length > 0 && (
                                    <section className="space-y-1">
                                        <h4 className="px-3 py-1 text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                            <ShoppingBag size={10} /> السوق
                                        </h4>
                                        {results.items.map(i => (
                                            <Link
                                                key={i.id}
                                                href={`/content-admin/marketplace?id=${i.id}`}
                                                onClick={() => setIsOpen(false)}
                                                className="flex flex-col px-3 py-2 rounded-lg hover:bg-muted text-sm"
                                            >
                                                <span className="font-medium">{i.title}</span>
                                                <span className="text-[10px] text-muted-foreground">/{i.slug}</span>
                                            </Link>
                                        ))}
                                    </section>
                                )}

                                {results.places.length > 0 && (
                                    <section className="space-y-1">
                                        <h4 className="px-3 py-1 text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                            <MapPin size={10} /> الأماكن
                                        </h4>
                                        {results.places.map(p => (
                                            <Link
                                                key={p.id}
                                                href={`/content-admin/places?id=${p.id}`}
                                                onClick={() => setIsOpen(false)}
                                                className="flex flex-col px-3 py-2 rounded-lg hover:bg-muted text-sm"
                                            >
                                                <span className="font-medium">{p.name}</span>
                                                <span className="text-[10px] text-muted-foreground">/{p.slug}</span>
                                            </Link>
                                        ))}
                                    </section>
                                )}

                                {results.users.length === 0 && results.items.length === 0 && results.places.length === 0 && (
                                    <div className="py-8 text-center text-muted-foreground">
                                        <p className="text-sm">لم يتم العثور على نتائج لـ "{query}"</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Backdrop to close */}
            {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
        </div>
    )
}
