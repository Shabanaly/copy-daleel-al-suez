'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ContactSellerButtons } from './contact-seller-buttons'
import { SellerControls } from './seller-controls'

interface MarketplaceSellerActionsProps {
    item: {
        id: string
        title: string
        slug: string
        category: string
        seller_id: string
        seller_phone?: string
        seller_whatsapp?: string
        status: string
        expires_at?: string | null
    }
}

export function MarketplaceSellerActions({ item }: MarketplaceSellerActionsProps) {
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

    if (loading) {
        return <div className="h-32 bg-muted/50 animate-pulse rounded-xl border border-border" />
    }

    const isOwner = user?.id === item.seller_id

    return (
        <div className="space-y-4">
            {!isOwner ? (
                <ContactSellerButtons
                    itemId={item.id}
                    itemTitle={item.title}
                    itemSlug={item.slug || item.id}
                    category={item.category}
                    sellerPhone={item.seller_phone}
                    sellerWhatsapp={item.seller_whatsapp}
                />
            ) : (
                <SellerControls itemId={item.id} item={item as any} />
            )}
        </div>
    )
}
