import { useEffect, useRef } from 'react'
import { incrementViewAction, incrementViewsBatchAction } from '@/app/actions/view-actions'

type TableName = 'categories' | 'places' | 'events' | 'marketplace_items' | 'articles' | 'community_questions'

// Shared queue for all instances of the hook
let viewQueue: { tableName: string, id: string }[] = []
let flushTimer: NodeJS.Timeout | null = null

const flushQueue = async () => {
    if (viewQueue.length === 0) return
    const currentBatch = [...viewQueue]
    viewQueue = []

    try {
        await incrementViewsBatchAction(currentBatch)
    } catch (error) {
        console.error('Failed to flush view queue:', error)
    }
}

export function useViewIncrement(tableName: TableName, id: string) {
    const hasIncremented = useRef(false)

    useEffect(() => {
        if (hasIncremented.current) return

        const addToQueue = () => {
            // Check if already in queue to avoid duplicates in same batch
            const exists = viewQueue.some(item => item.tableName === tableName && item.id === id)
            if (!exists) {
                viewQueue.push({ tableName, id })
            }
            hasIncremented.current = true

            // Set up or reset flush timer
            if (!flushTimer) {
                flushTimer = setTimeout(() => {
                    flushQueue()
                    flushTimer = null
                }, 2000) // Flush every 2 seconds if there are items
            }
        }

        // Slight delay to ensure it's a real view
        const timer = setTimeout(() => {
            addToQueue()
        }, 1000)

        return () => clearTimeout(timer)
    }, [tableName, id])
}
