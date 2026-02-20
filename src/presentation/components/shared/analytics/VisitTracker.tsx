'use client'

import { useEffect } from 'react'

export function VisitTracker() {
    useEffect(() => {
        // key includes date to reset daily
        const today = new Date().toISOString().split('T')[0]
        const key = `daleel_visit_${today}`

        const hasVisited = sessionStorage.getItem(key)

        if (!hasVisited) {
            // incrementVisit() // Temporary disabled due to admin redesign
            sessionStorage.setItem(key, 'true')
        }
    }, [])

    return null
}
