import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { X, Home, Calendar, Plus, MapPin, Clock, Star, User, Settings, LogOut, Menu, ShoppingBag, Store, LayoutGrid, Newspaper, AlertTriangle, Shield, MessageSquare, Key } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MobileDrawerProps {
    user: any
}

const navigationItems = [
    { icon: Home, label: 'الرئيسية', href: '/' },
    { icon: ShoppingBag, label: 'سوق السويس', href: '/marketplace' },
    { icon: Calendar, label: 'الفعاليات والأحداث', href: '/events' },
    { icon: Newspaper, label: 'أخبار السويس', href: '/news' },
    { icon: AlertTriangle, label: 'دليل الطوارئ', href: '/categories/health' },
    { icon: Clock, label: 'مواقيت الصلاة', href: '/prayer-times' },
]

export function MobileDrawer({ user }: MobileDrawerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        setMounted(true)
        // Check admin role
        if (user) {
            supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()
                .then(({ data }) => {
                    if (data && ['admin', 'super_admin'].includes(data.role)) {
                        setIsAdmin(true)
                    }
                })
        }
    }, [user])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
        setIsOpen(false)
    }

    return (
        <>
            {/* Menu Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
                aria-label="Open menu"
            >
                <Menu size={24} />
            </button>

            {/* Drawer Portal */}
            {mounted && isOpen && createPortal(
                <AnimatePresence mode="wait">
                    <div className="fixed inset-0 z-[100] lg:hidden">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Drawer Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="absolute top-0 right-0 h-[100dvh] w-72 bg-background border-l border-border shadow-2xl flex flex-col"
                        >
                            {/* Header */}
                            <div className="bg-background/95 backdrop-blur border-b border-border p-3 flex items-center justify-between flex-shrink-0">
                                <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                                    القائمة
                                </h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-accent rounded-full transition-colors border border-border/50"
                                    aria-label="Close menu"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* User Section */}
                            {user ? (
                                <div className="p-3 bg-gradient-to-br from-primary/5 to-blue-500/5 border-b border-border flex-shrink-0">
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-background border border-border/50 shadow-sm hover:shadow-md transition-all"
                                    >
                                        {user.user_metadata?.avatar_url ? (
                                            <img
                                                src={user.user_metadata.avatar_url}
                                                alt={user.user_metadata?.full_name || 'صورة المستخدم'}
                                                className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-primary/30"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-inner">
                                                {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || '؟'}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold truncate text-foreground text-sm">
                                                {user.user_metadata?.full_name || 'مستخدم'}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                    </Link>
                                </div>
                            ) : (
                                <div className="p-3 border-b border-border flex-shrink-0 bg-muted/20">
                                    <Link
                                        href="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground py-2.5 px-3 rounded-xl text-center font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <User size={16} />
                                        <span>تسجيل الدخول</span>
                                    </Link>
                                    <p className="text-center text-[11px] text-muted-foreground mt-1.5">
                                        سجّل الدخول للوصول إلى كافة المميزات
                                    </p>
                                </div>
                            )}

                            {/* Navigation Items - Scrollable */}
                            <nav className="flex-1 overflow-y-auto py-2 px-2.5 space-y-0.5 scrollbar-hide">
                                {navigationItems.map((item) => {
                                    const Icon = item.icon
                                    const isHome = item.href === '/'
                                    const isActive = isHome
                                        ? (pathname === '/' || pathname.startsWith('/categories') || pathname.startsWith('/places') || pathname === '/map')
                                        : (item.href !== '/' && pathname.startsWith(item.href))

                                    return (
                                        <div key={item.href}>
                                            <Link
                                                href={item.href}
                                                onClick={() => setIsOpen(false)}
                                                className={`
                                                flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 group
                                                ${isActive
                                                        ? 'bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/20'
                                                        : 'hover:bg-accent text-foreground/70 hover:text-foreground'
                                                    }
                                            `}
                                            >
                                                <Icon size={18} className={`transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary'}`} />
                                                <span className="font-medium text-sm">{item.label}</span>
                                            </Link>

                                            {/* Submenu for Home (Directory Hub) */}
                                            {isHome && isActive && (
                                                <div className="mr-6 border-r-2 border-primary/20 pr-3 mt-1.5 space-y-0.5 animate-in slide-in-from-right-2 duration-300">
                                                    <Link
                                                        href="/categories"
                                                        onClick={() => setIsOpen(false)}
                                                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium hover:bg-accent hover:text-primary transition-colors"
                                                    >
                                                        <LayoutGrid size={15} />
                                                        <span>تصفح التصنيفات</span>
                                                    </Link>
                                                    <Link
                                                        href="/places/new"
                                                        onClick={() => setIsOpen(false)}
                                                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium hover:bg-accent hover:text-primary transition-colors"
                                                    >
                                                        <Plus size={15} />
                                                        <span>أضف مكان جديد</span>
                                                    </Link>
                                                    <Link
                                                        href="/map"
                                                        onClick={() => setIsOpen(false)}
                                                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium hover:bg-accent hover:text-primary transition-colors"
                                                    >
                                                        <MapPin size={15} />
                                                        <span>الخريطة التفاعلية</span>
                                                    </Link>
                                                </div>
                                            )}

                                            {/* Promoted Content Admin Link for Admins (Top-level) */}
                                            {isHome && isAdmin && (
                                                <div className="space-y-0.5 mt-0.5">
                                                    <Link
                                                        href="/content-admin"
                                                        onClick={() => setIsOpen(false)}
                                                        className={cn(
                                                            "flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                                                            pathname === '/content-admin'
                                                                ? 'bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/20'
                                                                : 'hover:bg-accent text-foreground/70 hover:text-foreground'
                                                        )}
                                                    >
                                                        <Shield size={18} className={cn("transition-colors", pathname === '/content-admin' ? 'text-primary' : 'group-hover:text-primary')} />
                                                        <span className="font-medium text-sm">إدارة المحتوى (نظرة عامة)</span>
                                                    </Link>
                                                    <div className="mr-6 border-r-2 border-primary/20 pr-3 space-y-0.5">
                                                        {[
                                                            { label: 'إدارة السوق', href: '/content-admin/marketplace', icon: ShoppingBag },
                                                            { label: 'إشراف المجتمع', href: '/content-admin/community', icon: MessageSquare },
                                                            { label: 'الأخبار والفعاليات', href: '/content-admin/news', icon: Newspaper },
                                                            { label: 'طلبات التوثيق', href: '/content-admin/claims', icon: Key },
                                                        ].map((sub) => {
                                                            const SubIcon = sub.icon;
                                                            return (
                                                                <Link
                                                                    key={sub.href}
                                                                    href={sub.href}
                                                                    onClick={() => setIsOpen(false)}
                                                                    className={cn(
                                                                        "flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors",
                                                                        pathname === sub.href ? "bg-primary/10 text-primary" : "hover:bg-accent hover:text-primary"
                                                                    )}
                                                                >
                                                                    <SubIcon size={15} />
                                                                    <span>{sub.label}</span>
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Submenu for Marketplace */}
                                            {item.href === '/marketplace' && isActive && (
                                                <div className="mr-6 border-r-2 border-primary/20 pr-3 mt-1.5 space-y-0.5 animate-in slide-in-from-right-2 duration-300">
                                                    <Link
                                                        href="/marketplace/new"
                                                        onClick={() => setIsOpen(false)}
                                                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium hover:bg-accent hover:text-primary transition-colors"
                                                    >
                                                        <Plus size={15} />
                                                        <span>أضف إعلان</span>
                                                    </Link>
                                                    <Link
                                                        href="/marketplace/my-items"
                                                        onClick={() => setIsOpen(false)}
                                                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium hover:bg-accent hover:text-primary transition-colors"
                                                    >
                                                        <Store size={15} />
                                                        <span>إعلاناتي</span>
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </nav>

                            {/* Bottom Section - Fixed at bottom */}
                            <div className="border-t border-border bg-muted/20 flex-shrink-0 p-3 space-y-2">
                                {user && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <Link
                                            href="/favorites"
                                            onClick={() => setIsOpen(false)}
                                            className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-background border border-border/50 hover:border-primary/50 hover:bg-accent/50 transition-all group"
                                        >
                                            <Star size={17} className="text-muted-foreground group-hover:text-yellow-500 transition-colors" />
                                            <span className="text-[11px] font-medium">المفضلة</span>
                                        </Link>
                                        <Link
                                            href="/settings"
                                            onClick={() => setIsOpen(false)}
                                            className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-background border border-border/50 hover:border-primary/50 hover:bg-accent/50 transition-all group"
                                        >
                                            <Settings size={17} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                            <span className="text-[11px] font-medium">الإعدادات</span>
                                        </Link>
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    {user && (
                                        <button
                                            onClick={handleSignOut}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors font-medium text-sm"
                                        >
                                            <LogOut size={16} />
                                            <span>خروج</span>
                                        </button>
                                    )}
                                </div>

                                <div className="flex justify-center pt-1">
                                    <p className="text-[10px] text-muted-foreground/60 font-medium tracking-wider">
                                        DALEEL AL SUEZ v2.0
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </AnimatePresence>,
                document.body
            )}
        </>
    )
}
