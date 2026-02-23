'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Flag, Users, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const ADMIN_LINKS = [
    { href: '/content-admin/marketplace', label: 'الإعلانات', icon: Package },
    { href: '/admin/reports', label: 'البلاغات العامة', icon: Flag }
]

export function AdminHeader() {
    const pathname = usePathname()

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center gap-4 px-4 overflow-x-auto">
                <Link href="/marketplace" className="flex items-center gap-2 text-sm font-medium hover:text-primary shrink-0">
                    <ArrowRight size={16} />
                    <span>عودة للسوق</span>
                </Link>

                <div className="mx-2 h-4 w-[1px] bg-border shrink-0" />

                <nav className="flex items-center gap-1">
                    {ADMIN_LINKS.map((link) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Icon size={16} />
                                <span>{link.label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </header>
    )
}
