'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { trackUserEvent } from '@/actions/analytics.actions'

export function SearchTracker() {
    const searchParams = useSearchParams()
    const query = searchParams.get('query')
    const lastTrackedQuery = useRef<string | null>(null)

    useEffect(() => {
        if (!query || query.length < 2) return
        if (query === lastTrackedQuery.current) return

        // Debounce/Delay to ensure it's a deliberate search result view
        const timer = setTimeout(() => {
            trackUserEvent({
                eventType: 'search',
                metadata: { query }
            })
            lastTrackedQuery.current = query
        }, 1500)

        return () => clearTimeout(timer)
    }, [query])

    return null
}
