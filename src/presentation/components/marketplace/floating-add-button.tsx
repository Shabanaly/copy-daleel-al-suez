'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function MarketplaceFloatingAddButton() {
    const [isVisible, setIsVisible] = useState(true)
    const pathname = usePathname()

    // Hide on the "add new item" or "edit item" pages to avoid redundancy
    const shouldHide = pathname === '/marketplace/new' ||
        pathname === '/marketplace/add' ||
        pathname?.includes('/marketplace/edit');

    useEffect(() => {
        const handleScroll = () => {
            // Check if footer is visible
            const footer = document.querySelector('footer')
            if (footer) {
                const footerRect = footer.getBoundingClientRect()
                const windowHeight = window.innerHeight

                // If footer is entering the viewport, hide the button
                if (footerRect.top < windowHeight) {
                    setIsVisible(false)
                } else {
                    setIsVisible(true)
                }
            }
        }

        window.addEventListener('scroll', handleScroll)
        // Initial check
        handleScroll()

        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    if (shouldHide) return null;

    return (
        <Link
            href="/marketplace/new"
            className={cn(
                "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-primary text-white px-5 py-2.5 md:px-8 md:py-4 rounded-full shadow-xl hover:bg-primary/90 transition-all duration-300 active:scale-95 group",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
            )}
        >
            <Plus className="w-5 h-5 md:w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-bold text-sm md:text-lg whitespace-nowrap">إضافة إعلان</span>
        </Link>
    )
}
