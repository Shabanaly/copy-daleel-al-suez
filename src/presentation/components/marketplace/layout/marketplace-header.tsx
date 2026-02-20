'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Menu, Search, User, Compass, PlusCircle, Store } from 'lucide-react'
import { ThemeToggle } from '@/presentation/components/shared/theme-toggle'
import { NotificationBell } from '@/presentation/features/notifications/components/notification-bell'
import { createClient } from '@/lib/supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'
import Image from 'next/image'
import { MarketplaceSearchBar } from './marketplace-search-bar'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { MarketplaceCategoriesTabs } from '../marketplace-categories-tabs'
import { MobileDrawer } from '@/presentation/components/shared/layout/mobile-drawer'

export function MarketplaceHeader() {
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [user, setUser] = useState<SupabaseUser | null>(null)
    const supabase = createClient()
    const pathname = usePathname()

    useEffect(() => {
        setMounted(true)
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        checkUser()
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })
        return () => subscription.unsubscribe()
    }, [])

    // Handle back button to close search overlay
    useEffect(() => {
        if (isSearchOpen) {
            window.history.pushState({ marketplaceSearch: true }, '')
            const handlePopState = () => {
                setIsSearchOpen(false)
            }
            window.addEventListener('popstate', handlePopState)
            return () => {
                window.removeEventListener('popstate', handlePopState)
            }
        }
    }, [isSearchOpen])

    // Show tabs on browse and search pages
    const showTabs = pathname === '/marketplace/browse' || pathname === '/marketplace/search'

    return (
        <div className="sticky top-0 z-50 w-full">
            <header className="relative z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:pr-[64px] transition-all duration-300">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">

                    {/* Brand / Logo */}
                    <Link href="/marketplace" className="flex items-center gap-3 shrink-0">
                        <div className="bg-orange-500/10 p-2 rounded-lg">
                            <Store className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="flex flex-col flex-shrink-0">
                            <span className="text-lg font-bold leading-none text-orange-600">سوق السويس</span>
                            <span className="text-[10px] text-muted-foreground hidden sm:block">بيع واشتري في مدينتك</span>
                        </div>
                    </Link>

                    {/* Search Bar - Desktop Expands */}
                    <div className="hidden md:flex flex-1 max-w-2xl justify-center">
                        <MarketplaceSearchBar />
                    </div>

                    {/* Actions - Minimalist */}
                    <div className="flex items-center gap-1 md:gap-2 shrink-0">

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-2">
                            <ThemeToggle />
                            {user && <NotificationBell />}

                            {user ? (
                                <Link
                                    href={`/marketplace/seller/${user.id}`}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-accent transition-colors border border-border/50 text-foreground text-sm font-medium"
                                    title="حسابي"
                                >
                                    <User size={16} />
                                    <span className="hidden lg:inline-block max-w-[100px] truncate">
                                        {user.user_metadata?.full_name?.split(' ')[0] || 'حسابي'}
                                    </span>
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="flex items-center gap-2 px-5 py-2 rounded-full bg-orange-600 text-white hover:bg-orange-700 transition-all text-sm font-bold shadow-lg shadow-orange-500/20"
                                >
                                    <User size={16} />
                                    <span>دخول</span>
                                </Link>
                            )}
                        </div>

                        {/* Mobile Actions */}
                        <div className="flex md:hidden items-center gap-2">
                            <button
                                className="p-2 text-foreground/80 hover:text-orange-600 transition-colors"
                                onClick={() => setIsSearchOpen(true)}
                            >
                                <Search size={24} />
                            </button>
                            {user && <NotificationBell />}
                            <MobileDrawer user={user} />
                        </div>
                    </div>
                </div>

                {/* Mobile Search Overlay */}
                {isSearchOpen && mounted && createPortal(
                    <div className="md:hidden fixed inset-0 z-[120] bg-background flex flex-col p-4 animate-in fade-in slide-in-from-top-5">
                        <MarketplaceSearchBar initialMobileFocus={true} onClose={() => setIsSearchOpen(false)} />
                    </div>,
                    document.body
                )}
            </header>

            {/* Sub Header / Tabs */}
            {showTabs && <MarketplaceCategoriesTabs />}
        </div>
    )
}
