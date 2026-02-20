'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Home,
    ShoppingBag,
    Calendar,
    MapPin,
    Clock,
    PlusCircle,
    LayoutGrid,
    Newspaper,
    ChevronLeft,
    ChevronRight,
    Star,
    Settings,
    UserCircle,
    AlertTriangle,
    Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface SidebarItemProps {
    icon: any
    label: string
    href: string
    active: boolean
    isExpanded: boolean
    badge?: string
    subItems?: { label: string, href: string, icon?: any }[]
}

function SidebarItem({ icon: Icon, label, href, active, isExpanded, badge, subItems }: SidebarItemProps) {
    return (
        <div className="space-y-1">
            <Link href={href} className="block group font-bold">
                <div className={cn(
                    "flex items-center transition-all duration-300 relative rounded-lg",
                    isExpanded ? "px-2.5 py-2 gap-2.5" : "h-10 w-10 justify-center",
                    active
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}>
                    <Icon size={18} className={cn("flex-shrink-0 transition-transform duration-300", !active && "group-hover:scale-110")} />

                    <AnimatePresence>
                        {isExpanded && (
                            <motion.span
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="text-xs font-semibold whitespace-nowrap overflow-hidden"
                            >
                                {label}
                            </motion.span>
                        )}
                    </AnimatePresence>

                    {badge && !isExpanded && (
                        <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-background" />
                    )}

                    {badge && isExpanded && (
                        <span className="mr-auto bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                            {badge}
                        </span>
                    )}
                </div>
            </Link>

            {/* Sub Items - Only if expanded and parent is active */}
            <AnimatePresence>
                {isExpanded && active && subItems && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden flex flex-col pr-8 space-y-1"
                    >
                        {subItems.map((sub, idx) => (
                            <Link
                                key={idx}
                                href={sub.href}
                                className="text-[13px] py-2 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2.5 group/sub"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-border group-hover/sub:bg-primary transition-colors shrink-0" />
                                {sub.label}
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export function DesktopSidebar() {
    const [isHovered, setIsHovered] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()
                if (profile && ['admin', 'super_admin'].includes(profile.role)) {
                    setIsAdmin(true)
                }
            } catch { /* silent */ }
        }
        checkAdmin()
    }, [])

    const marketplaceSubItems = [
        { label: 'أضف إعلان', href: '/marketplace/new' },
        { label: 'إعلاناتي', href: '/marketplace/my-items' },
    ]

    const mainNav = [
        {
            icon: Home,
            label: 'الرئيسية',
            href: '/',
            subItems: [
                { label: 'تصفح التصنيفات', href: '/categories' },
                { label: 'أضف مكان جديد', href: '/places/new' },
                { label: 'الخريطة التفاعلية', href: '/map' },
            ]
        },
        ...(isAdmin ? [
            {
                icon: LayoutGrid,
                label: 'إدارة المحتوى',
                href: '/content-admin',
                subItems: [
                    { label: 'إدارة السوق', href: '/content-admin/marketplace' },
                    { label: 'إشراف المجتمع', href: '/content-admin/community' },
                    { label: 'الأخبار والفعاليات', href: '/content-admin/news' },
                    { label: 'طلبات التوثيق', href: '/content-admin/claims' },
                ]
            }
        ] : []),
        {
            icon: ShoppingBag,
            label: 'سوق السويس',
            href: '/marketplace',
            subItems: marketplaceSubItems
        },
        { icon: Calendar, label: 'الفعاليات والأحداث', href: '/events' },
        { icon: Newspaper, label: 'أخبار السويس', href: '/news' },
    ]

    const utilityNav = [
        { icon: AlertTriangle, label: 'دليل الطوارئ', href: '/categories/health' },
        { icon: Clock, label: 'مواقيت الصلاة', href: '/prayer-times' },
    ]

    const userNav = [
        { icon: Star, label: 'المفضلة', href: '/favorites' },
        { icon: UserCircle, label: 'حسابي الشخصي', href: '/profile' },
        { icon: Settings, label: 'الإعدادات', href: '/settings' },
    ]

    return (
        <aside
            className="hidden md:block fixed right-0 top-16 h-[calc(100vh-64px)] z-50 group/sidebar"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.div
                animate={{ width: isHovered ? 240 : 64 }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                className={cn(
                    "h-full bg-background border-l border-border/50 shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl bg-background/95",
                    isHovered ? "rounded-l-3xl" : "rounded-none"
                )}
            >
                {/* Main Navigation */}
                <div className="flex-1 overflow-y-auto px-1.5 py-3 space-y-4 scrollbar-hide">
                    {/* Primary */}
                    <div className="space-y-1">
                        {mainNav.map((item) => {
                            const isHome = item.href === '/'
                            const isActive = isHome
                                ? (pathname === '/' || pathname.startsWith('/categories') || pathname.startsWith('/places') || pathname === '/map')
                                : (item.href !== '/' && pathname.startsWith(item.href))

                            return (
                                <SidebarItem
                                    key={item.href}
                                    {...item}
                                    active={isActive}
                                    isExpanded={isHovered}
                                />
                            )
                        })}
                    </div>

                    <div className="h-px bg-border/40 mx-2" />

                    {/* Services & Utility */}
                    <div className="space-y-1">
                        {isHovered && <p className="text-[9px] font-bold text-muted-foreground/40 px-3 uppercase tracking-widest pb-1">خدمات وأدوات</p>}
                        {utilityNav.map((item) => (
                            <SidebarItem
                                key={item.href}
                                {...item}
                                active={pathname === item.href}
                                isExpanded={isHovered}
                            />
                        ))}
                    </div>

                    <div className="h-px bg-border/40 mx-2" />

                    {/* Profile & Settings */}
                    <div className="space-y-1">
                        {isHovered && <p className="text-[9px] font-bold text-muted-foreground/40 px-3 uppercase tracking-widest pb-1">الحساب</p>}
                        {userNav.map((item) => (
                            <SidebarItem
                                key={item.href}
                                {...item}
                                active={pathname === item.href}
                                isExpanded={isHovered}
                            />
                        ))}
                    </div>
                </div>

                {/* Footer / Toggle Indicator */}
                <div className="p-4 flex items-center justify-center border-t border-border/50 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-muted-foreground transition-colors group-hover/sidebar:bg-primary group-hover/sidebar:text-white">
                        {isHovered ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </div>
                </div>
            </motion.div>
        </aside>
    )
}
