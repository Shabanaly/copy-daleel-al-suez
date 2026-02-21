'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Menu, X, Search, User, Heart, Compass, PlusCircle, Store } from 'lucide-react'
import { ThemeToggle } from '../theme-toggle'
import { NotificationBell } from '@/presentation/features/notifications/components/notification-bell'
import { createClient } from '@/lib/supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'
import Image from 'next/image'
import { HeaderSearchBar } from './header-search-bar'
import { MobileDrawer } from './mobile-drawer'
import { MarketplaceHeader } from '@/presentation/components/marketplace/layout/marketplace-header'


import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function Header({ settings }: { settings?: Record<string, unknown> }) {
    const [showSearch, setShowSearch] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [user, setUser] = useState<SupabaseUser | null>(null)
    const supabase = createClient()
    const pathname = usePathname()
    const isMarketplace = pathname?.startsWith('/marketplace')
    const isHomePage = pathname === '/'
    const isCategoryPage = pathname === '/categories' || pathname === '/categories/all'

    useEffect(() => {
        setTimeout(() => setMounted(true), 0)

        // Scroll listener for homepage search visibility
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setShowSearch(true)
            } else {
                setShowSearch(false)
            }
        }

        if (isHomePage) {
            window.addEventListener('scroll', handleScroll)
            // Initial check
            handleScroll()
        } else {
            setShowSearch(true)
        }

        return () => window.removeEventListener('scroll', handleScroll)
    }, [isHomePage])

    useEffect(() => {
        setIsSearchOpen(false)
    }, [pathname])

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        checkUser()
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })
        return () => subscription.unsubscribe()
    }, [supabase.auth])

    // --- Market Mode Split ---
    if (isMarketplace) {
        return <MarketplaceHeader />
    }

    // --- Global Header ---
    return (
        <div className="sticky top-0 z-50 w-full">
            <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:pr-[64px] transition-all duration-300">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                    {/* Logo & Title */}
                    <Link href="/" className="flex items-center gap-3 flex-shrink-0">
                        {settings?.site_logo ? (
                            <Image
                                src={settings.site_logo as string}
                                alt={(settings?.site_name as string) || "Logo"}
                                width={36}
                                height={36}
                                className="w-9 h-9 rounded-lg object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Compass className="w-5 h-5 text-primary" />
                            </div>
                        )}
                        <span className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 inline-block">
                            {(settings?.site_name as string) || "دليل السويس"}
                        </span>
                    </Link>



                    {/* Premium Search Bar - Expands to fill space */}
                    <div className={cn(
                        "hidden md:flex flex-1 justify-center max-w-2xl transition-all duration-300",
                        showSearch && !isCategoryPage ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
                    )}>
                        {!isCategoryPage && <HeaderSearchBar />}
                    </div>

                    {/* Desktop Actions - Minimalist */}
                    <div className="hidden md:flex items-center gap-2">
                        <ThemeToggle />
                        {user && <NotificationBell />}

                        {user ? (
                            <Link
                                href="/profile"
                                className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-accent transition-all border border-border/40 bg-muted/30"
                                title="حسابي"
                            >
                                <span className="hidden sm:inline-block text-sm font-bold text-foreground max-w-[120px] truncate">
                                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                                </span>
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20">
                                    {user.user_metadata?.avatar_url ? (
                                        <Image
                                            src={user.user_metadata.avatar_url}
                                            alt="User"
                                            width={32}
                                            height={32}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User size={18} />
                                    )}
                                </div>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm font-bold shadow-lg shadow-primary/20"
                            >
                                <User size={16} />
                                <span>دخول</span>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Actions */}
                    <div className="flex md:hidden items-center gap-2">
                        {(!isHomePage || showSearch) && !isCategoryPage && (
                            <button
                                className="p-2 text-foreground/80 hover:text-primary transition-colors animate-in fade-in"
                                onClick={() => { setIsSearchOpen(true); }}
                                aria-label="Search"
                            >
                                <Search size={24} />
                            </button>
                        )}
                        {user && <NotificationBell />}
                        <MobileDrawer user={user} />
                    </div>
                </div>

                {/* Mobile Search Overlay */}
                {isSearchOpen && mounted && createPortal(
                    <div className="md:hidden fixed inset-0 z-[100] bg-background animate-in fade-in slide-in-from-top-5 flex flex-col p-4">
                        <HeaderSearchBar initialMobileFocus={true} onClose={() => setIsSearchOpen(false)} />
                    </div>,
                    document.body
                )}
            </header>
        </div>
    )
}