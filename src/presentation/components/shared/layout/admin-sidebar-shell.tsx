'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    Menu,
    X,
    Home,
    LogOut,
    LayoutDashboard,
    ShoppingBag,
    MessageSquare,
    Newspaper,
    Key,
    Users,
    Flag,
    Settings,
    ShieldCheck,
    MapPin,
    Layers,
    Activity,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// ─── Type Definitions ────────────────────────────────────────────────────────

interface NavItem {
    name: string
    href: string
    icon: React.ElementType
}

interface NavGroup {
    name: string
    icon: React.ElementType
    items: NavItem[]
}

// ─── Nav Configs (defined here to stay client-side) ──────────────────────────

const CONTENT_ADMIN_GROUPS: NavGroup[] = [
    {
        name: 'إدارة المحتوى',
        icon: LayoutDashboard,
        items: [
            { name: 'نظرة عامة', href: '/content-admin', icon: LayoutDashboard },
            { name: 'إدارة الأماكن', href: '/content-admin/places', icon: MapPin },
            { name: 'إدارة السوق', href: '/content-admin/marketplace', icon: ShoppingBag },
            { name: 'إشراف المجتمع', href: '/content-admin/community', icon: MessageSquare },
            { name: 'الأخبار والفعاليات', href: '/content-admin/news', icon: Newspaper },
            { name: 'طلبات التوثيق', href: '/content-admin/claims', icon: Key },
        ],
    },
]

const SUPER_ADMIN_GROUPS: NavGroup[] = [
    {
        name: 'الرئيسية',
        icon: LayoutDashboard,
        items: [
            { name: 'ملخص النظام', href: '/admin', icon: LayoutDashboard },
            { name: 'إدارة المحتوى', href: '/content-admin', icon: ShieldCheck },
        ],
    },
    {
        name: 'النظام والأمان',
        icon: ShieldCheck,
        items: [
            { name: 'المستخدمين', href: '/admin/users', icon: Users },
            { name: 'إدارة التصنيفات', href: '/admin/categories', icon: Layers },
            { name: 'البلاغات', href: '/admin/reports', icon: Flag },
            { name: 'نبض السويس', href: '/admin/city-pulse', icon: Activity },
            { name: 'إعدادات الموقع', href: '/admin/settings', icon: Settings },
        ],
    },
]

// ─── Props (only serializable values) ────────────────────────────────────────

export interface AdminNavProps {
    variant: 'content-admin' | 'super-admin'
    subtitle: string
    isSuperAdmin?: boolean
}

function getConfig(variant: AdminNavProps['variant'], isSuperAdmin?: boolean) {
    if (variant === 'content-admin') {
        return {
            groups: CONTENT_ADMIN_GROUPS,
            title: 'إدارة المحتوى',
            homeLink: '/',
            backLink: isSuperAdmin ? { label: 'لوحة Super Admin', href: '/admin' } : undefined,
        }
    }
    return {
        groups: SUPER_ADMIN_GROUPS,
        title: 'لوحة التحكم',
        homeLink: '/',
        backLink: { label: 'إدارة المحتوى', href: '/content-admin' },
    }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isItemActive(pathname: string, href: string) {
    if (href === '/admin') return pathname === '/admin'
    if (href === '/content-admin') return pathname === '/content-admin'
    return pathname.startsWith(href)
}

// ─── Shared Nav Items Renderer ───────────────────────────────────────────────

function NavItems({
    groups,
    collapsed = false,
    onNavigate,
}: {
    groups: NavGroup[]
    collapsed?: boolean
    onNavigate?: () => void
}) {
    const pathname = usePathname()
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
        Object.fromEntries(groups.map(g => [g.name, true]))
    )

    const toggle = (name: string) =>
        setExpandedGroups(prev => ({ ...prev, [name]: !prev[name] }))

    return (
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
            {groups.map(group => {
                const GroupIcon = group.icon
                const isExpanded = expandedGroups[group.name]

                return (
                    <div key={group.name} className="space-y-1">
                        {!collapsed && (
                            <button
                                onClick={() => toggle(group.name)}
                                className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-black text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                            >
                                <div className="flex items-center gap-1.5">
                                    <GroupIcon size={12} className="text-primary/70" />
                                    <span>{group.name}</span>
                                </div>
                                {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                            </button>
                        )}

                        <AnimatePresence initial={false}>
                            {(collapsed || isExpanded) && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.18 }}
                                    className="overflow-hidden space-y-0.5"
                                >
                                    {group.items.map(item => {
                                        const Icon = item.icon
                                        const active = isItemActive(pathname, item.href)
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                title={collapsed ? item.name : undefined}
                                                onClick={onNavigate}
                                                className={cn(
                                                    'flex items-center gap-3 rounded-xl text-sm font-bold transition-all group relative',
                                                    collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5',
                                                    active
                                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                )}
                                            >
                                                <Icon size={17} className={cn('flex-shrink-0', active ? 'text-white' : 'group-hover:text-primary')} />
                                                {!collapsed && <span className="truncate">{item.name}</span>}
                                                {active && !collapsed && <div className="absolute left-2 w-1 h-5 bg-white rounded-full" />}
                                            </Link>
                                        )
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )
            })}
        </nav>
    )
}

// ─── Shared Footer ────────────────────────────────────────────────────────────

function NavFooter({
    homeLink,
    backLink,
    collapsed = false,
    onNavigate,
}: {
    homeLink: string
    backLink?: { label: string; href: string }
    collapsed?: boolean
    onNavigate?: () => void
}) {
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    return (
        <div className={cn('border-t border-border p-3 space-y-1 flex-shrink-0', collapsed && 'flex flex-col items-center gap-1')}>
            {backLink && (
                <Link
                    href={backLink.href}
                    title={collapsed ? backLink.label : undefined}
                    onClick={onNavigate}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors w-full"
                >
                    <ChevronRight size={15} className="flex-shrink-0" />
                    {!collapsed && <span className="truncate">{backLink.label}</span>}
                </Link>
            )}
            <Link
                href={homeLink}
                title={collapsed ? 'العودة للموقع' : undefined}
                onClick={onNavigate}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
            >
                <Home size={15} className="flex-shrink-0" />
                {!collapsed && <span>العودة للموقع</span>}
            </Link>
            <button
                onClick={handleSignOut}
                title={collapsed ? 'خروج' : undefined}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
            >
                <LogOut size={15} className="flex-shrink-0" />
                {!collapsed && <span>خروج</span>}
            </button>
        </div>
    )
}

// ─── Desktop Sidebar ─────────────────────────────────────────────────────────

export function AdminDesktopSidebar({ variant, subtitle, isSuperAdmin }: AdminNavProps) {
    const { groups, title, homeLink, backLink } = getConfig(variant, isSuperAdmin)
    const [collapsed, setCollapsed] = useState(false)

    return (
        <motion.aside
            animate={{ width: collapsed ? 64 : 240 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="hidden lg:flex flex-col bg-card border-l border-border h-screen sticky top-0 shadow-xl z-40 overflow-hidden flex-shrink-0"
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-muted/20 h-16 flex-shrink-0 px-4 gap-2">
                <AnimatePresence initial={false}>
                    {!collapsed && (
                        <motion.div
                            key="logo-text"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center gap-3 overflow-hidden flex-1 min-w-0"
                        >
                            <div className="w-9 h-9 rounded-xl bg-primary flex-shrink-0 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                                د
                            </div>
                            <div className="min-w-0">
                                <p className="font-black text-xs text-foreground truncate">{title}</p>
                                <p className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none mt-0.5 truncate">{subtitle}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {collapsed && (
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 mx-auto">
                        د
                    </div>
                )}

                <button
                    onClick={() => setCollapsed(c => !c)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
                >
                    {collapsed ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
                </button>
            </div>

            <NavItems groups={groups} collapsed={collapsed} />
            <NavFooter homeLink={homeLink} backLink={backLink} collapsed={collapsed} />
        </motion.aside>
    )
}

// ─── Mobile Drawer Trigger ────────────────────────────────────────────────────

export function AdminMobileDrawerTrigger({ variant, subtitle, isSuperAdmin }: AdminNavProps) {
    const { groups, title, homeLink, backLink } = getConfig(variant, isSuperAdmin)
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="القائمة الإدارية"
            >
                <Menu size={22} />
            </button>

            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <div className="fixed inset-0 z-[200]">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                onClick={() => setIsOpen(false)}
                            />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                className="absolute top-0 right-0 h-[100dvh] w-72 bg-card border-l border-border flex flex-col shadow-2xl"
                                dir="rtl"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20 flex-shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                                            د
                                        </div>
                                        <div>
                                            <p className="font-black text-xs text-foreground">{title}</p>
                                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none mt-0.5">{subtitle}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 hover:bg-muted rounded-full transition-colors border border-border/50"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <NavItems groups={groups} onNavigate={() => setIsOpen(false)} />
                                <NavFooter homeLink={homeLink} backLink={backLink} onNavigate={() => setIsOpen(false)} />
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    )
}
