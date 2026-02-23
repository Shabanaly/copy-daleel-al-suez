'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { User, Loader2, LogOut, Shield, AlertTriangle, LifeBuoy, Bell, Activity, Mail, Calendar, Heart, PlusCircle, Star, Settings, Building2 } from 'lucide-react'
import { useAuthActions } from '@/presentation/hooks/use-auth-actions'
import { User as SupabaseUser } from '@supabase/supabase-js'
import Image from 'next/image'
import Link from 'next/link'
import { Breadcrumbs } from '@/presentation/components/ui/Breadcrumbs'
import { ProfileTabs, type TabItem } from '@/presentation/features/profile/profile-tabs'
import { OverviewSection } from '@/presentation/features/profile/overview-section'
import { ActivityDashboard } from '@/presentation/features/profile/activity-dashboard'
import { motion } from 'framer-motion'
import { UserReviewsSection } from './user-reviews-section'
import { UserNotificationsSection } from './user-notifications-section'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/presentation/ui/accordion"

type TabType = 'overview' | 'contributions' | 'notifications'

interface Profile {
    role?: string
    [key: string]: unknown
}

interface ProfileContentProps {
    initialUser: SupabaseUser
    initialProfile: Profile | null
}

export function ProfileContent({ initialUser, initialProfile }: ProfileContentProps) {
    const [user, setUser] = useState<SupabaseUser | null>(initialUser)
    const [profile, setProfile] = useState<Profile | null>(initialProfile)
    const [loading, setLoading] = useState(!initialUser)
    const [activeTab, setActiveTab] = useState<TabType>('overview')
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()
    const { handleSignOut, loading: isSigningOut } = useAuthActions()


    useEffect(() => {
        const tabParam = searchParams.get('tab')
        if (tabParam && ['overview', 'contributions'].includes(tabParam)) {
            setActiveTab(tabParam as TabType)
        }
    }, [searchParams])

    useEffect(() => {
        if (!initialUser) {
            const getUser = async () => {
                try {
                    const { data: { user }, error } = await supabase.auth.getUser()

                    if (error || !user) {
                        router.push('/login')
                        return
                    }

                    setUser(user)

                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single()

                    if (profile) {
                        setProfile(profile)
                    }

                } catch (error: unknown) {
                    console.error('Error fetching user:', error)
                } finally {
                    setLoading(false)
                }
            }

            getUser()
        }
    }, [initialUser, router, supabase])


    // Unified logout handled by useAuthActions

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) return null

    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'
    const adminHref = profile?.role === 'super_admin' ? '/admin' : '/content-admin'

    const tabs: (TabItem<TabType> & { component: React.ReactNode })[] = [
        { id: 'overview', label: 'نظرة عامة', icon: User, component: <OverviewSection user={user} isAdmin={isAdmin} /> },
        {
            id: 'contributions',
            label: 'مساهماتي',
            icon: Activity,
            component: (
                <div className="space-y-8">
                    <ActivityDashboard />
                    <UserReviewsSection />
                </div>
            )
        },
        { id: 'notifications', label: 'التنبيهات', icon: Bell, component: <UserNotificationsSection /> },
    ]

    const joinDate = new Date(user.created_at).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Sticky Breadcrumbs */}
            <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <Breadcrumbs
                        items={[
                            { label: 'الملف الشخصي' }
                        ]}
                    />
                    <Link
                        href="/settings"
                        className="p-2 -m-2 text-muted-foreground hover:text-primary transition-colors"
                        aria-label="الإعدادات"
                    >
                        <Settings size={20} />
                    </Link>
                </div>
            </div>

            {/* Hero Section - Responsive height */}
            <div className="relative h-[50vh] md:h-[40vh] w-full overflow-hidden">
                {/* Background with gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-blue-600" />

                {/* Pattern Overlay */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                </div>

                {/* Gradient Overlay - Strong like EventDetailView */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />

                {/* Avatar & Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 lg:p-10">
                    <div className="container mx-auto max-w-7xl">
                        {/* Mobile: Centered Layout */}
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 text-center md:text-right">
                            {/* Avatar */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="relative"
                            >
                                <div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-card rounded-full p-1.5 border-4 border-card shadow-2xl ring-2 ring-primary/30">
                                    <div className="w-full h-full bg-muted rounded-full flex items-center justify-center text-muted-foreground overflow-hidden">
                                        {user.user_metadata?.avatar_url ? (
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={user.user_metadata.avatar_url}
                                                    alt="avatar"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <User size={40} className="md:w-12 md:h-12 lg:w-16 lg:h-16" />
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                            {/* User Info */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                                className="flex-1 pb-2"
                            >
                                {/* Role Badge */}
                                {isAdmin && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/90 backdrop-blur-md border border-indigo-400/30 text-white text-xs font-medium mb-2 md:mb-3 shadow-lg">
                                        <Star size={14} />
                                        <span>مدير النظام</span>
                                    </div>
                                )}

                                <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-2 text-foreground">
                                    {user.user_metadata?.full_name || 'مستخدم دليل السويس'}
                                </h1>

                                {/* Meta Info - Stack on mobile */}
                                <div className="flex flex-col md:flex-row md:flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 lg:gap-4">
                                    <div className="flex items-center gap-2 text-xs md:text-sm lg:text-base bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
                                        <Mail size={14} className="md:w-4 md:h-4" />
                                        <span className="font-medium text-foreground truncate max-w-[200px] md:max-w-none">{user.email}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs md:text-sm lg:text-base bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
                                        <Calendar size={14} className="md:w-4 md:h-4" />
                                        <span className="font-medium text-foreground whitespace-nowrap">انضم {joinDate}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-6 md:py-8 lg:py-12 max-w-7xl">
                {/* Mobile: Tabs with Accordion */}
                <div className="md:hidden mb-6">
                    <Accordion type="single" collapsible value={activeTab} onValueChange={(val) => val && setActiveTab(val as TabType)}>
                        {tabs.map((tab) => (
                            <AccordionItem key={tab.id} value={tab.id} className="border border-border rounded-2xl mb-3 overflow-hidden bg-card">
                                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent">
                                    <div className="flex items-center gap-2">
                                        <tab.icon size={18} />
                                        <span className="font-medium">{tab.label}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4">
                                    {tab.component}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    {/* Quick Actions - Mobile */}
                    <div className="space-y-3 mt-6">
                        <h3 className="text-lg font-bold px-2">روابط سريعة</h3>

                        <Link
                            href="/business/dashboard"
                            className="flex items-center gap-3 p-4 bg-card hover:bg-accent border border-border hover:border-primary/30 rounded-2xl transition-all group shadow-sm"
                        >
                            <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-500/10 text-green-600 dark:text-green-400 rounded-xl group-hover:scale-110 transition-transform">
                                <Building2 size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-foreground text-sm">لوحة أنشطتي</p>
                                <p className="text-xs text-muted-foreground">إداره نشاطك التجاري</p>
                            </div>
                        </Link>

                        <Link
                            href="/favorites"
                            className="flex items-center gap-3 p-4 bg-card hover:bg-accent border border-border hover:border-primary/30 rounded-2xl transition-all group shadow-sm"
                        >
                            <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-500/10 text-red-600 dark:text-red-400 rounded-xl group-hover:scale-110 transition-transform">
                                <Heart size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-foreground text-sm">مفضلاتي</p>
                                <p className="text-xs text-muted-foreground">الأماكن المحفوظة</p>
                            </div>
                        </Link>

                        {isAdmin && (
                            <Link
                                href={adminHref}
                                className="flex items-center gap-3 p-4 bg-card hover:bg-accent border border-border hover:border-primary/30 rounded-2xl transition-all group shadow-sm"
                            >
                                <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:scale-110 transition-transform">
                                    <Star size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-foreground text-sm">لوحة التحكم</p>
                                    <p className="text-xs text-muted-foreground">صلاحيات الأدمن</p>
                                </div>
                            </Link>
                        )}

                        {/* Logout Button */}
                        <button
                            onClick={handleSignOut}
                            disabled={isSigningOut}
                            className="flex items-center justify-center gap-2 w-full p-4 text-destructive bg-card border border-border hover:bg-destructive/10 hover:border-destructive/30 rounded-2xl transition-all font-medium shadow-sm disabled:opacity-50"
                        >
                            {isSigningOut ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} />}
                            {isSigningOut ? 'جاري الخروج...' : 'تسجيل الخروج'}
                        </button>
                    </div>
                </div>

                {/* Desktop: Grid Layout */}
                <div className="hidden md:grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar - Quick Actions */}
                    <div className="lg:col-span-1 space-y-4">
                        <h3 className="text-lg font-bold px-2">روابط سريعة</h3>

                        <Link
                            href="/business/dashboard"
                            className="flex items-center gap-3 p-4 bg-card hover:bg-accent border border-border hover:border-primary/30 rounded-2xl transition-all group shadow-sm hover:shadow-md"
                        >
                            <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-500/10 text-green-600 dark:text-green-400 rounded-xl group-hover:scale-110 transition-transform">
                                <Building2 size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-foreground text-sm">لوحة أنشطتي</p>
                                <p className="text-xs text-muted-foreground">إدارة نشاطك التجاري</p>
                            </div>
                        </Link>

                        <Link
                            href="/favorites"
                            className="flex items-center gap-3 p-4 bg-card hover:bg-accent border border-border hover:border-primary/30 rounded-2xl transition-all group shadow-sm hover:shadow-md"
                        >
                            <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-500/10 text-red-600 dark:text-red-400 rounded-xl group-hover:scale-110 transition-transform">
                                <Heart size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-foreground text-sm">مفضلاتي</p>
                                <p className="text-xs text-muted-foreground">الأماكن المحفوظة</p>
                            </div>
                        </Link>

                        {isAdmin && (
                            <Link
                                href={adminHref}
                                className="flex items-center gap-3 p-4 bg-card hover:bg-accent border border-border hover:border-primary/30 rounded-2xl transition-all group shadow-sm hover:shadow-md"
                            >
                                <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:scale-110 transition-transform">
                                    <Star size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-foreground text-sm">لوحة التحكم</p>
                                    <p className="text-xs text-muted-foreground">صلاحيات الأدمن</p>
                                </div>
                            </Link>
                        )}

                        {/* Logout Button */}
                        <button
                            onClick={handleSignOut}
                            disabled={isSigningOut}
                            className="flex items-center justify-center gap-2 w-full p-4 text-destructive bg-card border border-border hover:bg-destructive/10 hover:border-destructive/30 rounded-2xl transition-all font-medium shadow-sm disabled:opacity-50"
                        >
                            {isSigningOut ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} />}
                            {isSigningOut ? 'جاري الخروج...' : 'تسجيل الخروج'}
                        </button>
                    </div>

                    {/* Main Content - Tabs */}
                    <div className="lg:col-span-3">
                        <div className="bg-card backdrop-blur-xl border border-border rounded-3xl p-6 md:p-8">
                            <ProfileTabs items={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mt-6"
                            >
                                {tabs.find(t => t.id === activeTab)?.component}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
