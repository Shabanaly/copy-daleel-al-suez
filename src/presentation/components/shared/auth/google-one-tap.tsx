'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { env } from '@/lib/env'

declare global {
    interface Window {
        google: any
    }
}

export function GoogleOneTap() {
    const supabase = createClient()
    const router = useRouter()
    const googleClientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    useEffect(() => {
        if (!googleClientId) return

        const handleCredentialResponse = async (response: any) => {
            try {
                const { data, error } = await supabase.auth.signInWithIdToken({
                    provider: 'google',
                    token: response.credential,
                })

                if (error) throw error

                console.log('Successfully signed in with Google One Tap')
                router.refresh()
            } catch (error) {
                console.error('Error signing in with Google One Tap:', error)
            }
        }

        // Initialize Google One Tap
        const initializeOneTap = () => {
            if (typeof window !== 'undefined' && window.google) {
                window.google.accounts.id.initialize({
                    client_id: googleClientId,
                    callback: handleCredentialResponse,
                    auto_select: false, // Don't auto-select if multiple accounts
                    cancel_on_tap_outside: true,
                })

                window.google.accounts.id.prompt((notification: any) => {
                    if (notification.isNotDisplayed()) {
                        console.log('One Tap not displayed:', notification.getNotDisplayedReason())
                    } else if (notification.isSkippedMoment()) {
                        console.log('One Tap skipped:', notification.getSkippedReason())
                    } else if (notification.isDismissedMoment()) {
                        console.log('One Tap dismissed:', notification.getDismissedReason())
                    }
                })
            }
        }

        // Check if user is already logged in before initializing
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                initializeOneTap()
            }
        }

        checkUser()

        return () => {
            // Cleanup if necessary
            if (typeof window !== 'undefined' && window.google) {
                window.google.accounts.id.cancel()
            }
        }
    }, [supabase, router, googleClientId])

    return null
}
