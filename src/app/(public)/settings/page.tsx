'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    Moon, Sun, Bell, Globe, Shield,
    HelpCircle, LogOut, ChevronLeft,
    Trash2, Smartphone, Mail, User,
    Lock, Eye, Palette, BellRing,
    MessageSquare, ChevronRight, ArrowRight,
    Camera, Loader2, CheckCircle2, AlertCircle, FileText
} from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { updateProfile, updatePassword } from '@/actions/profile.actions'
import { toast } from 'sonner'
import SupabaseImageUpload from '@/presentation/components/ui/supabase-image-upload'
import { User as SupabaseUser } from '@supabase/supabase-js'

type SettingCategory = 'profile' | 'security' | 'display' | 'notifications' | 'support'

export default function SettingsPage() {
    const { theme, setTheme } = useTheme()
    const router = useRouter()
    const supabase = createClient()

    const [activeCategory, setActiveCategory] = useState<SettingCategory>('profile')
    const [isMobileDrillDown, setIsMobileDrillDown] = useState(false)
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)
    const [user, setUser] = useState<SupabaseUser | null>(null)
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    router.push('/login')
                    return
                }
                setUser(user)

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                setProfile(profile)
            } catch (error) {
                console.error('Error fetching settings:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [supabase, router])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) return null // Prevent rendering content if not logged in

    const categories = [
        { id: 'profile' as const, label: 'الملف الشخصي', icon: User, color: 'text-blue-500' },
        { id: 'security' as const, label: 'الأمان والخصوصية', icon: Shield, color: 'text-purple-500' },
        { id: 'display' as const, label: 'المظهر واللغة', icon: Palette, color: 'text-pink-500' },
        { id: 'notifications' as const, label: 'الإشعارات', icon: BellRing, color: 'text-orange-500' },
        { id: 'support' as const, label: 'الدعم والمساعدة', icon: HelpCircle, color: 'text-green-500' },
    ]

    const handleCategoryClick = (id: SettingCategory) => {
        setActiveCategory(id)
        setIsMobileDrillDown(true)
    }

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0" dir="rtl">
            {/* Header Mobile Only */}
            <div className="md:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {isMobileDrillDown && (
                            <button
                                onClick={() => setIsMobileDrillDown(false)}
                                className="p-2 -mr-2 hover:bg-accent rounded-full transition-colors"
                            >
                                <ArrowRight size={20} />
                            </button>
                        )}
                        <h1 className="text-xl font-bold">
                            {isMobileDrillDown
                                ? categories.find(c => c.id === activeCategory)?.label
                                : 'الإعدادات'}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 md:py-10 max-w-6xl">
                <div className="flex flex-col md:flex-row gap-8 min-h-[600px]">

                    {/* Sidebar / Desktop Navigation */}
                    <aside className={cn(
                        "w-full md:w-80 space-y-2 md:block",
                        isMobileDrillDown ? "hidden" : "block"
                    )}>
                        <div className="px-2 mb-6 hidden md:block">
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">الإعدادات</h1>
                            <p className="text-muted-foreground mt-2">تحكم في حسابك وخصص تجربتك</p>
                        </div>

                        {/* User Summary Card */}
                        <div className="mb-8 p-4 bg-gradient-to-br from-primary/10 to-blue-600/10 border border-primary/20 rounded-2xl md:block shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shadow-lg overflow-hidden border-2 border-white dark:border-slate-800">
                                    {user?.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        (user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold truncate text-sm md:text-base">{user?.user_metadata?.full_name || 'مستخدم دليل السويس'}</h3>
                                    <p className="text-[10px] md:text-xs text-muted-foreground truncate opacity-70">{user?.email}</p>
                                </div>
                            </div>
                        </div>

                        <nav className="space-y-1">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 group",
                                        activeCategory === cat.id
                                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                                            : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                            activeCategory === cat.id ? "bg-white/20" : "bg-muted group-hover:bg-background"
                                        )}>
                                            <cat.icon size={18} className={activeCategory === cat.id ? "text-white" : cat.color} />
                                        </div>
                                        <span className="font-bold text-sm">{cat.label}</span>
                                    </div>
                                    <ChevronLeft size={16} className={cn("transition-transform", activeCategory === cat.id ? "translate-x-1" : "opacity-0 md:opacity-100")} />
                                </button>
                            ))}
                        </nav>

                        {/* Sign Out - Desktop Bottom */}
                        <div className="pt-6 mt-6 border-t border-border">
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 p-3.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-bold text-sm"
                            >
                                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                                    <LogOut size={18} />
                                </div>
                                تسجيل الخروج
                            </button>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <main className={cn(
                        "flex-1 bg-card border border-border rounded-3xl overflow-hidden shadow-xl mb-10 md:mb-0 md:block",
                        !isMobileDrillDown ? "hidden" : "block"
                    )}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeCategory}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="h-full"
                            >
                                {activeCategory === 'profile' && <ProfileSettings user={user!} profile={profile} />}
                                {activeCategory === 'security' && <SecuritySettings user={user!} />}
                                {activeCategory === 'display' && <DisplaySettings theme={theme} setTheme={setTheme} />}
                                {activeCategory === 'notifications' && <NotificationSettings enabled={notificationsEnabled} setEnabled={setNotificationsEnabled} />}
                                {activeCategory === 'support' && <SupportSettings />}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    )
}

// --- Sub-components for Categories ---

interface ProfileSettingsProps {
    user: SupabaseUser
    profile: any
}

function ProfileSettings({ user, profile }: ProfileSettingsProps) {
    const [fullName, setFullName] = useState(user.user_metadata?.full_name || '')
    const [phone, setPhone] = useState(user.user_metadata?.phone || '')
    const [city, setCity] = useState(user.user_metadata?.city || 'السويس')
    const [isUpdating, setIsUpdating] = useState(false)

    const handleUpdate = async () => {
        setIsUpdating(true)
        try {
            const result = await updateProfile({
                fullName,
                phone,
                city
            })
            if (result.success) {
                toast.success('تم تحديث الملف الشخصي بنجاح')
            }
        } catch (error: any) {
            toast.error(error.message || 'حدث خطأ أثناء التحديث')
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className="p-6 md:p-10 space-y-8">
            <header className="space-y-1">
                <h2 className="text-2xl font-bold">الملف الشخصي</h2>
                <p className="text-muted-foreground text-sm">أدر معلوماتك الشخصية وكيف يراك الآخرون</p>
            </header>

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-muted/30 rounded-2xl border border-border outline-none">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-white shadow-xl overflow-hidden">
                            {user.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                (fullName[0] || user.email?.[0] || 'U').toUpperCase()
                            )}
                        </div>
                    </div>
                    <div className="space-y-3 flex-1 w-full">
                        <div className="w-full max-w-xs">
                            <SupabaseImageUpload
                                value={user.user_metadata?.avatar_url}
                                onChange={async (url) => {
                                    if (url) {
                                        const imageUrl = Array.isArray(url) ? url[0] : url
                                        await updateProfile({ avatarUrl: imageUrl })
                                        toast.success('تم تحديث الصورة الشخصية')
                                    }
                                }}
                                bucketName="avatars"
                                maxFiles={1}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">يفضل استخدام صورة مربعة واضحة.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold px-1">الاسم بالكامل</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold px-1">البريد الإلكتروني</label>
                        <input
                            type="email"
                            defaultValue={user.email}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-muted cursor-not-allowed outline-none"
                            readOnly
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold px-1">رقم الهاتف</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="01xxxxxxxxx"
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all text-left"
                            dir="ltr"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold px-1">المدينة</label>
                        <select
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none"
                        >
                            <option value="السويس">السويس</option>
                            <option value="القاهرة">القاهرة</option>
                            <option value="الإسماعيلية">الإسماعيلية</option>
                            <option value="بورسعيد">بورسعيد</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        onClick={handleUpdate}
                        disabled={isUpdating}
                        className="w-full md:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg hover:shadow-primary/25 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {isUpdating ? (
                            <div className="flex items-center gap-2">
                                <Loader2 size={18} className="animate-spin" />
                                جاري الحفظ...
                            </div>
                        ) : 'حفظ التعديلات'}
                    </button>
                </div>
            </div>
        </div>
    )
}

interface SecuritySettingsProps {
    user: SupabaseUser
}

function SecuritySettings({ user }: SecuritySettingsProps) {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)

    const handleUpdatePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error('كلمات المرور الجديدة غير متطابقة')
            return
        }
        if (newPassword.length < 6) {
            toast.error('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل')
            return
        }

        setIsUpdating(true)
        try {
            const result = await updatePassword({
                currentPassword,
                newPassword
            })
            if (result.success) {
                toast.success('تم تحديث كلمة المرور بنجاح')
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
            }
        } catch (error: any) {
            toast.error(error.message || 'حدث خطأ أثناء التحديث')
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className="p-6 md:p-10 space-y-8">
            <header className="space-y-1">
                <h2 className="text-2xl font-bold">الأمان والخصوصية</h2>
                <p className="text-muted-foreground text-sm">تحكم في كلمات المرور وجلسات الدخول</p>
            </header>

            <div className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">تغيير كلمة المرور</h3>
                    <div className="space-y-4 bg-muted/20 p-6 rounded-2xl border border-border/50">
                        <div className="space-y-2">
                            <label className="text-xs font-bold opacity-70">كلمة المرور الحالية</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-border outline-none bg-background"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold opacity-70">كلمة المرور الجديدة</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-border outline-none bg-background"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold opacity-70">تأكيد كلمة المرور</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-border outline-none bg-background"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleUpdatePassword}
                            disabled={isUpdating || !currentPassword || !newPassword}
                            className="px-6 py-2 bg-secondary text-white rounded-lg text-sm font-bold shadow-sm disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {isUpdating ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                        </button>
                    </div>
                </div>

                <hr className="border-border/50" />

                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest px-1">منطقة الخطر</h3>
                    <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/10 space-y-4">
                        <div>
                            <h4 className="font-bold text-red-600 dark:text-red-400">حذف الحساب</h4>
                            <p className="text-sm text-red-500/70">بمجرد حذف حسابك، سيتم حذف جميع بياناتك نهائياً. لا يمكن التراجع عن هذا الإجراء.</p>
                        </div>
                        <button className="flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold shadow-md hover:bg-red-600 transition-colors">
                            <Trash2 size={16} />
                            حذف الحساب نهائياً
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function DisplaySettings({ theme, setTheme }: any) {
    return (
        <div className="p-6 md:p-10 space-y-8">
            <header className="space-y-1">
                <h2 className="text-2xl font-bold">المظهر واللغة</h2>
                <p className="text-muted-foreground text-sm">خصص شكل التطبيق وتفضيلات العرض</p>
            </header>

            <div className="space-y-8">
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase px-1">المظهر العام</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setTheme('light')}
                            className={cn(
                                "relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all",
                                theme === 'light' ? "border-primary bg-primary/5 shadow-md" : "border-border hover:bg-muted"
                            )}
                        >
                            <Sun size={32} className={theme === 'light' ? "text-primary" : "text-muted-foreground"} />
                            <span className="font-bold">فاتح</span>
                            {theme === 'light' && <div className="absolute top-2 left-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center"><ChevronRight size={10} className="text-white rotate-180" /></div>}
                        </button>
                        <button
                            onClick={() => setTheme('dark')}
                            className={cn(
                                "relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all",
                                theme === 'dark' ? "border-primary bg-primary/5 shadow-md" : "border-border hover:bg-muted"
                            )}
                        >
                            <Moon size={32} className={theme === 'dark' ? "text-primary" : "text-muted-foreground"} />
                            <span className="font-bold">داكن</span>
                            {theme === 'dark' && <div className="absolute top-2 left-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center"><ChevronRight size={10} className="text-white rotate-180" /></div>}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase px-1">اللغة</h3>
                    <div className="bg-muted/10 border border-border rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shadow-sm">
                                <Globe size={20} className="text-primary" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">اللغة الحالية</p>
                                <p className="text-xs text-muted-foreground">التطبيق متوفر حالياً باللغة العربية فقط</p>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-primary px-3 py-1 bg-primary/10 rounded-lg">العربية (الأصلية)</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function NotificationSettings({ enabled, setEnabled }: any) {
    return (
        <div className="p-6 md:p-10 space-y-8">
            <header className="space-y-1">
                <h2 className="text-2xl font-bold">الإشعارات</h2>
                <p className="text-muted-foreground text-sm">تحكم في التنبيهات التي تصلك وطرق استقبالها</p>
            </header>

            <div className="space-y-2">
                <div className="bg-muted/10 border border-border rounded-2xl divide-y divide-border/50">
                    <ToggleField
                        title="إشعارات التطبيق"
                        description="تلقي تنبيهات عن أحدث الأماكن والفعاليات"
                        value={enabled}
                        onChange={setEnabled}
                    />
                    <ToggleField
                        title="إشعارات البريد الإلكتروني"
                        description="ملخص أسبوعي لأهم أخبار السويس"
                        value={true}
                    />
                    <ToggleField
                        title="العروض والخصومات"
                        description="لا تفوت صفقات سوق السويس الحصرية"
                        value={true}
                    />
                </div>
            </div>
        </div>
    )
}

function SupportSettings() {
    return (
        <div className="p-6 md:p-10 space-y-8">
            <header className="space-y-1">
                <h2 className="text-2xl font-bold">الدعم والمساعدة</h2>
                <p className="text-muted-foreground text-sm">نحن هنا لمساعدتك في أي وقت</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SupportCard icon={HelpCircle} title="مركز المساعدة" description="تصفح الأسئلة الشائعة والحلول" />
                <SupportCard icon={MessageSquare} title="تواصل معنا" description="راسلنا مباشرة عبر واتساب" />
                <SupportCard icon={Shield} title="سياسة الخصوصية" description="كيف نحمي بياناتك" />
                <SupportCard icon={FileText} title="شروط الاستخدام" description="قواعد استخدام المنصة" />
            </div>

            <div className="mt-10 p-6 bg-primary/5 rounded-3xl border border-primary/10 text-center space-y-4">
                <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-lg border border-primary/20 scale-110">
                    <Smartphone className="text-primary" size={32} />
                </div>
                <div>
                    <h4 className="font-bold text-lg">دليل السويس - v2.0.0</h4>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2 leading-relaxed">
                        شكراً لكونك جزءاً من مجتمعنا. نحن نعمل باستمرار على تحسين تجربتك.
                    </p>
                </div>
            </div>
        </div>
    )
}

// --- Utility Components ---

function ToggleField({ title, description, value, onChange }: any) {
    return (
        <div className="flex items-center justify-between p-6">
            <div className="space-y-1">
                <p className="font-bold">{title}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <button
                onClick={() => onChange?.(!value)}
                className={cn(
                    "w-12 h-6 rounded-full p-1 transition-colors duration-300 relative",
                    value ? "bg-primary" : "bg-muted-foreground/30"
                )}
            >
                <div className={cn(
                    "w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300",
                    value ? "translate-x-6" : "translate-x-0"
                )} />
            </button>
        </div>
    )
}

function SupportCard({ icon: Icon, title, description }: any) {
    return (
        <button className="flex items-center gap-4 p-5 rounded-2xl border border-border hover:bg-accent/50 hover:border-primary/30 transition-all text-right group">
            <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <Icon size={24} />
            </div>
            <div>
                <p className="font-bold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
        </button>
    )
}
