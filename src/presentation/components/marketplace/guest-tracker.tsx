'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export const VIEWED_ITEMS_KEY = 'daleel_viewed_items'
export const VIEWED_CATEGORIES_KEY = 'daleel_viewed_categories'
export const VIEWED_SUBTYPES_KEY = 'daleel_viewed_subtypes'

export function GuestTracker() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        // 1. Track Item Views
        // Path: /marketplace/[slug-or-id]
        if (pathname?.startsWith('/marketplace/') && pathname.split('/').length > 2 && !pathname.includes('/browse')) {
            const parts = pathname.split('/')
            const slugOrId = parts[parts.length - 1]

            // Extract ID if possible (assuming slug-id format or just id)
            // Ideally we need the ID, but for now let's store what we have. 
            // If the URL structure is /marketplace/slug-id, we might need to parse.
            // But usually detail page knows the ID. 
            // This global tracker tracks "navigation". 
            // Better approach: The specific page components (ItemDetails) should log to localStorage.
            // But to be "global" and "automatic":

            // Actually, let's keep this component for "Session" tracking if needed.
            // But for "Viewed Items", it's safer to do it in the ItemDetails component itself where we have the real ID.
        }

        // 2. Track Category Views
        // Path: /marketplace/browse?category=...
        if (pathname === '/marketplace/browse') {
            const category = searchParams.get('category')
            if (category && category !== 'all') {
                console.log('Tracking Category View:', category)
                addToLocalStorage(VIEWED_CATEGORIES_KEY, category)
            }
        }

    }, [pathname, searchParams])

    return null
}

export function addToLocalStorage(key: string, value: string) {
    try {
        const stored = localStorage.getItem(key)
        let items: string[] = stored ? JSON.parse(stored) : []

        // Remove valid if exists (to move to top)
        items = items.filter(i => i !== value)

        // Add to front
        items.unshift(value)

        // Limit to 20
        if (items.length > 20) items.pop()

        localStorage.setItem(key, JSON.stringify(items))
    } catch (e) {
        // Ignore storage errors
    }
}

export function addObjectToLocalStorage(key: string, value: any) {
    try {
        const stored = localStorage.getItem(key)
        let items: any[] = stored ? JSON.parse(stored) : []

        // Remove duplicate by typeValue (assuming unique tracking per subtype)
        items = items.filter(i => i.typeValue !== value.typeValue)

        // Add to front
        items.unshift(value)

        // Limit to 20
        if (items.length > 20) items.pop()

        localStorage.setItem(key, JSON.stringify(items))
    } catch (e) {
        // Ignore storage errors
    }
}

export function getFromLocalStorage(key: string): any[] {
    if (typeof window === 'undefined') return []
    try {
        const stored = localStorage.getItem(key)
        return stored ? JSON.parse(stored) : []
    } catch (e) {
        return []
    }
}
