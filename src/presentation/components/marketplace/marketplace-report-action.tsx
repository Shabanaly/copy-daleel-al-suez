'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ReportDialog } from './report-dialog'

interface MarketplaceReportActionProps {
    itemId: string
    sellerId: string
}

export function MarketplaceReportAction({ itemId, sellerId }: MarketplaceReportActionProps) {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient()
            const { data: { user: authUser } } = await supabase.auth.getUser()
            setUser(authUser)
            setLoading(false)
        }
        fetchUser()
    }, [])

    if (loading) return null

    // Don't show report button if user is the owner
    if (user?.id === sellerId) return null

    return (
        <div className="pt-2 border-t border-primary/20">
            <ReportDialog itemId={itemId} />
        </div>
    )
}
