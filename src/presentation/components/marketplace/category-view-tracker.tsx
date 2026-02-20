'use client'

import { useEffect } from 'react'
import { trackUserEvent } from '@/actions/analytics.actions'

interface CategoryViewTrackerProps {
    category: string
    subType?: string | null
}

export function CategoryViewTracker({ category, subType }: CategoryViewTrackerProps) {
    useEffect(() => {
        if (!category) return

        const track = async () => {
            await trackUserEvent({
                eventType: 'view_category',
                categoryId: category,
                metadata: subType ? { subType } : undefined
            })
        }

        // Small delay to ensure true intent
        const timer = setTimeout(track, 2000)
        return () => clearTimeout(timer)
    }, [category, subType])

    return null
}
