'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    User, Shield, Palette, BellRing, HelpCircle, Eye,
    LogOut, ChevronLeft, ArrowRight, Loader2, Settings as SettingsIcon,
    Smartphone, Heart, Building2, Star
} from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useAuthActions } from '@/presentation/hooks/use-auth-actions'
import { Breadcrumbs } from '@/presentation/components/ui/Breadcrumbs'

// Import Modular Components
import { ProfileSettings } from './profile-settings'
import { SecuritySettings } from './security-settings'
import { DisplaySettings } from './display-settings'
import { NotificationSettings } from './notification-settings'
import { PrivacySettings } from './privacy-settings'

type SettingCategory = 'profile' | 'security' | 'display' | 'notifications' | 'privacy'

interface SettingsViewProps {
    user: SupabaseUser
    profile: any
}

export function SettingsView({ user, profile }: SettingsViewProps) {
    const { theme, setTheme } = useTheme()
    const router = useRouter()
    const supabase = createClient()
    const { handleSignOut, loading: isSigningOut } = useAuthActions()

    const [activeCategory, setActiveCategory] = useState<SettingCategory>('profile')
    const [isMobileDrillDown, setIsMobileDrillDown] = useState(false)

    const categories = [
        { id: 'profile' as const, label: 'الملف الشخصي', icon: User, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { id: 'security' as const, label: 'الأمان وكلمة المرور', icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { id: 'display' as const, label: 'المظهر واللغة', icon: Palette, color: 'text-pink-500', bg: 'bg-pink-500/10' },
        { id: 'notifications' as const, label: 'الإشعارات', icon: BellRing, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { id: 'privacy' as const, label: 'الخصوصية والظهور', icon: Eye, color: 'text-teal-500', bg: 'bg-teal-500/10' },
    ]

    const handleCategoryClick = (id: SettingCategory) => {
        setActiveCategory(id)
        setIsMobileDrillDown(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Unified logout handled by useAuthActions

    const activeCategoryLabel = categories.find(c => c.id === activeCategory)?.label

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-12" dir="rtl">
            {/* Sticky Breadcrumbs & Header */}
            <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 py-4">
                <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between">
                    <Breadcrumbs items={[{ label: 'الإعدادات' }]} />
                    <div className="flex items-center gap-2 text-muted-foreground whitespace-nowrap overflow-hidden">
                        <span className="hidden sm:inline text-xs font-medium opacity-60">الإصدار 2.0.0</span>
                        <SettingsIcon size={16} className="animate-spin-slow" />
                    </div>
                </div>
            </div>

            {/* Hero Section - Matching Profile Design */}
            <div className="relative h-[30vh] md:h-[35vh] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-blue-700/80" />
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
                    <div className="container mx-auto max-w-7xl">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-right">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative"
                            >
                                <div className="w-24 h-24 md:w-32 md:h-32 bg-card rounded-3xl p-1.5 border-4 border-card shadow-2xl ring-2 ring-primary/20 overflow-hidden">
                                    <div className="w-full h-full bg-muted rounded-2xl flex items-center justify-center text-primary text-3xl font-black">
                                        {user.user_metadata?.avatar_url ? (
                                            <img src={user.user_metadata.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            (user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                            <div className="flex-1 pb-2">
                                <h1 className="text-3xl md:text-4xl font-black text-foreground mb-2">إعدادات الحساب</h1>
                                <p className="text-muted-foreground font-medium md:text-lg flex items-center justify-center md:justify-start gap-2">
                                    أهلاً بك، {user.user_metadata?.full_name || 'مستخدمنـا العزيز'}
                                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <aside className={cn(
                        "w-full lg:w-80 space-y-6 lg:block",
                        isMobileDrillDown ? "hidden" : "block"
                    )}>
                        <div className="space-y-1">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                                        activeCategory === cat.id
                                            ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.03] z-10"
                                            : "hover:bg-card border border-transparent hover:border-border/50 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                            activeCategory === cat.id ? "bg-white/20 shadow-inner" : cn("bg-muted", cat.bg)
                                        )}>
                                            <cat.icon size={20} className={activeCategory === cat.id ? "text-white" : cat.color} />
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">{cat.label}</span>
                                    </div>
                                    <ChevronLeft size={18} className={cn("transition-all relative z-10", activeCategory === cat.id ? "translate-x-1 opacity-100" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0")} />

                                    {activeCategory === cat.id && (
                                        <motion.div
                                            layoutId="active-bg"
                                            className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 -z-0"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        <hr className="border-border/50" />

                        {/* Quick Links Section */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] px-4">روابط سريعة</h3>
                            <QuickLink href="/business/dashboard" icon={Building2} label="لوحة أنشطتي" color="text-green-500" />
                            <QuickLink href="/favorites" icon={Heart} label="مفضلاتي" color="text-red-500" />
                            {profile?.role === 'admin' && (
                                <QuickLink href="/admin" icon={Star} label="لوحة الإدارة" color="text-amber-500" />
                            )}
                        </div>

                        {/* Logout */}
                        <div className="pt-4">
                            <button
                                onClick={handleSignOut}
                                disabled={isSigningOut}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 transition-all font-bold group disabled:opacity-50"
                            >
                                <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform text-right">
                                    {isSigningOut ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} />}
                                </div>
                                <span className="flex-1">{isSigningOut ? 'جاري الخروج...' : 'تسجيل الخروج'}</span>
                                <ArrowRight size={18} className="opacity-40 group-hover:translate-x-[-4px] transition-transform" />
                            </button>
                        </div>
                    </aside>

                    {/* Mobile Header Drill Down */}
                    {isMobileDrillDown && (
                        <div className="lg:hidden flex items-center gap-4 mb-6 animate-in slide-in-from-right-4 duration-300">
                            <button
                                onClick={() => setIsMobileDrillDown(false)}
                                className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-primary shadow-sm active:scale-95 transition-all"
                            >
                                <ArrowRight size={20} />
                            </button>
                            <div>
                                <h2 className="text-xl font-black">{activeCategoryLabel}</h2>
                                <p className="text-xs text-muted-foreground">العودة لقائمة الإعدادات</p>
                            </div>
                        </div>
                    )}

                    {/* Main Content Area */}
                    <main className={cn(
                        "flex-1 bg-card/50 backdrop-blur-sm border border-border/60 rounded-[2.5rem] overflow-hidden shadow-2xl lg:block",
                        !isMobileDrillDown ? "hidden" : "block"
                    )}>
                        <div className="h-full min-h-[600px] p-1 md:p-2 lg:p-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeCategory}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="p-6 md:p-10 lg:p-12"
                                >
                                    {activeCategory === 'profile' && <ProfileSettings user={user} profile={profile} />}
                                    {activeCategory === 'security' && <SecuritySettings user={user} />}
                                    {activeCategory === 'display' && <DisplaySettings theme={theme} setTheme={setTheme} />}
                                    {activeCategory === 'notifications' && <NotificationSettings />}
                                    {activeCategory === 'privacy' && <PrivacySettings />}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}

function QuickLink({ href, icon: Icon, label, color }: { href: string, icon: any, label: string, color: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-card border border-transparent hover:border-border/50 text-muted-foreground hover:text-foreground transition-all group"
        >
            <div className={cn("w-10 h-10 rounded-xl bg-muted flex items-center justify-center transition-all group-hover:scale-110", color.replace('text', 'bg').concat('/10'), color)}>
                <Icon size={20} />
            </div>
            <span className="font-bold text-sm">{label}</span>
        </Link>
    )
}
