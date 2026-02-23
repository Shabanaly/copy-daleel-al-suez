'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

export function PlacesSearchBar() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [query, setQuery] = useState('') // Initialize with empty string

    // Sync with searchParams if they change (e.g. revalidation or direct URL change)
    useEffect(() => {
        // Use a tick to avoid "setState in effect" warning
        const timer = setTimeout(() => {
            setQuery(searchParams.get('search') || '')
        }, 0)
        return () => clearTimeout(timer)
    }, [searchParams])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        updateSearchParams(query)
    }

    const clearSearch = () => {
        setQuery('')
        updateSearchParams('')
    }

    const updateSearchParams = (searchQuery: string) => {
        const params = new URLSearchParams(searchParams.toString())

        if (searchQuery) {
            params.set('search', searchQuery)
        } else {
            params.delete('search')
        }

        router.push(`/places?${params.toString()}`)
        router.refresh() // Force server component to re-fetch data
    }

    return (
        <form onSubmit={handleSearch} className="relative w-full">
            <div className="relative group">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ابحث عن مطعم، كافيه، خدمة..."
                    className="w-full px-6 py-4 pr-14 rounded-full bg-muted/40 text-foreground border border-border/60 group-hover:border-primary/30 focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10 shadow-sm text-base transition-all duration-300 placeholder:text-muted-foreground/70"
                />

                {query && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute left-14 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                        <X size={18} />
                    </button>
                )}

                <button
                    type="submit"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-primary hover:brightness-110 active:scale-95 text-primary-foreground p-3 rounded-full transition-all shadow-md group-focus-within:ring-2 group-focus-within:ring-primary group-focus-within:ring-offset-2 ring-offset-background"
                >
                    <Search size={20} />
                </button>
            </div>
        </form>
    )
}
