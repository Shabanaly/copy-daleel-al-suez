'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function AuthListener() {
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                // Force a refresh to sync server components like Header
                router.refresh()
            }
            if (event === 'SIGNED_OUT') {
                router.refresh()
                router.push('/')
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [supabase, router])

    return null
}
