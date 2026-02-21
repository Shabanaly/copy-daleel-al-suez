import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { X, Home, Calendar, Plus, MapPin, Clock, Star, User, Settings, LogOut, Menu, ShoppingBag, Store, LayoutGrid, Newspaper, AlertTriangle, Shield, MessageSquare, Key, PlusCircle, Info, PhoneCall } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MobileDrawerProps {
    user: any
}

const navGroups = [
    {
        title: 'دليل المدينة',
        items: [
            { icon: Home, label: 'الرئيسية', href: '/' },
            { icon: LayoutGrid, label: 'تصفح الأقسام', href: '/categories' },
            { icon: MapPin, label: 'خريطة السويس', href: '/map' },
            { icon: Plus, label: 'أضف مكان جديد', href: '/places/new' },
        ]
    },
    {
        title: 'نبض السويس',
        items: [
            { icon: MessageSquare, label: 'المجتمع', href: '/community' },
            { icon: Newspaper, label: 'أخبار السويس', href: '/news' },
            { icon: Calendar, label: 'الفعاليات والأحداث', href: '/events' },
        ]
    },
    {
        title: 'سوق السويس',
        items: [
            { icon: ShoppingBag, label: 'سوق السويس', href: '/marketplace' },
            { icon: Store, label: 'إعلاناتي', href: '/marketplace/my-items' },
            { icon: PlusCircle, label: 'أضف إعلان', href: '/marketplace/new' },
        ]
    },
    {
        title: 'أدوات وخدمات',
        items: [
            { icon: Clock, label: 'مواقيت الصلاة', href: '/prayer-times' },
            { icon: AlertTriangle, label: 'دليل الطوارئ', href: '/categories/health' },
        ]
    }
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

                            {/* Navigation Groups - Scrollable */}
                            <nav className="flex-1 overflow-y-auto py-2 px-2.5 space-y-6 scrollbar-hide">
                                {navGroups.map((group, groupIdx) => (
                                    <div key={groupIdx} className="space-y-1">
                                        <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 pb-1">
                                            {group.title}
                                        </h3>
                                        <div className="space-y-0.5">
                                            {group.items.map((item) => {
                                                const Icon = item.icon
                                                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

                                                return (
                                                    <Link
                                                        key={item.href}
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
                                                        <span className="font-semibold text-sm">{item.label}</span>
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {/* Admin Section - Only for Admins */}
                                {isAdmin && (
                                    <div className="space-y-1 pt-2">
                                        <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 pb-1">
                                            الإدارة
                                        </h3>
                                        <Link
                                            href="/content-admin"
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                "flex items-center gap-2.5 px-3 py-3 rounded-xl transition-all duration-200 group border-2 border-dashed border-primary/20 hover:border-primary/50 hover:bg-primary/5",
                                                pathname.startsWith('/content-admin') || pathname.startsWith('/admin')
                                                    ? 'bg-primary/10 text-primary font-black ring-1 ring-primary/30'
                                                    : 'text-primary/70 hover:text-primary'
                                            )}
                                        >
                                            <Shield size={18} className="animate-pulse" />
                                            <span className="font-black text-sm uppercase">لوحة التحكم</span>
                                        </Link>
                                    </div>
                                )}

                                {/* Secondary Links */}
                                <div className="space-y-1 pt-4 border-t border-border/50">
                                    <div className="grid grid-cols-2 gap-1.5 p-1">
                                        <Link
                                            href="/about"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[11px] font-bold text-muted-foreground hover:bg-accent hover:text-primary transition-colors"
                                        >
                                            <Info size={14} />
                                            <span>عن الدليل</span>
                                        </Link>
                                        <Link
                                            href="/contact"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[11px] font-bold text-muted-foreground hover:bg-accent hover:text-primary transition-colors"
                                        >
                                            <PhoneCall size={14} />
                                            <span>اتصل بنا</span>
                                        </Link>
                                    </div>
                                </div>
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
