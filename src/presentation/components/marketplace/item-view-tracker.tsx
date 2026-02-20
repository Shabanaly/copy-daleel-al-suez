'use client'

import { useEffect } from 'react'
import { VIEWED_SUBTYPES_KEY, addObjectToLocalStorage } from './guest-tracker'
import { MARKETPLACE_FORMS } from '@/config/marketplace-forms'

interface ItemViewTrackerProps {
    categoryId: string
    attributes: Record<string, any>
}

export const SPOTLIGHT_LOCK_KEY = 'daleel_spotlight_lock'

export function ItemViewTracker({ categoryId, attributes }: ItemViewTrackerProps) {
    useEffect(() => {
        if (!categoryId || !attributes) return

        const categoryConfig = MARKETPLACE_FORMS[categoryId as keyof typeof MARKETPLACE_FORMS]
        if (!categoryConfig || !categoryConfig.typeSelector) return

        const typeKey = categoryConfig.typeSelector.name
        const typeValue = attributes[typeKey]

        if (typeValue) {
            const typeLabel = typeValue

            const trackingData = {
                categoryId,
                typeKey,
                typeValue,
                typeLabel,
                timestamp: Date.now()
            }

            // 1. Always add to raw history
            addObjectToLocalStorage(VIEWED_SUBTYPES_KEY, trackingData)

            // 2. Handle Spotlight Locking (30 minutes)
            try {
                const storedLock = localStorage.getItem(SPOTLIGHT_LOCK_KEY)
                let shouldUpdate = true

                if (storedLock) {
                    const parsedLock = JSON.parse(storedLock)
                    const timeDiff = Date.now() - parsedLock.timestamp
                    const THIRTY_MINUTES = 30 * 60 * 1000

                    // If lock is still fresh (< 30 mins), don't update
                    if (timeDiff < THIRTY_MINUTES) {
                        shouldUpdate = false
                    }
                }

                if (shouldUpdate) {
                    localStorage.setItem(SPOTLIGHT_LOCK_KEY, JSON.stringify(trackingData))
                }
            } catch (e) {
                // Fallback: just set it
                localStorage.setItem(SPOTLIGHT_LOCK_KEY, JSON.stringify(trackingData))
            }
        }

    }, [categoryId, attributes])

    return null
}
