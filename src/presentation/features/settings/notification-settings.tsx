'use client'

import { useState, useEffect } from 'react'
import { Loader2, Bell, Mail, Smartphone, RefreshCw, CheckCircle2 } from 'lucide-react'
import { Switch } from '@/presentation/ui/switch'
import { Label } from '@/presentation/ui/label'
import { getNotificationPreferences, updateNotificationPreferences } from '@/actions/notification-preferences.actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface NotificationPreferences {
    email_notifications: boolean
    push_notifications: boolean
    notify_new_reviews: boolean
    notify_review_replies: boolean
    notify_favorite_updates: boolean
    notify_account_changes: boolean
    notify_marketing: boolean
}

export function NotificationSettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)

    useEffect(() => {
        loadPreferences()
    }, [])

    const loadPreferences = async () => {
        try {
            const data = await getNotificationPreferences()
            setPreferences(data)
        } catch (error: unknown) {
            toast.error('فشل تحميل التفضيلات')
        } finally {
            setLoading(false)
        }
    }

    const handleToggle = async (key: string, value: boolean) => {
        if (!preferences) return

        const oldPreferences = { ...preferences }
        const newPreferences = { ...preferences, [key]: value } as NotificationPreferences

        setPreferences(newPreferences)
        setSaving(true)

        try {
            await updateNotificationPreferences(newPreferences as unknown as Record<string, unknown>)
            // Silent success for better UX
        } catch (error) {
            setPreferences(oldPreferences)
            toast.error('فشل تحديث التفضيلات')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-24">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <header className="flex items-center justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold">الإشعارات</h2>
                    <p className="text-muted-foreground text-sm">تحكم في التنبيهات التي تصلك وكيفية استلامها</p>
                </div>
                {saving ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-xs font-bold text-muted-foreground animate-pulse">
                        <RefreshCw size={12} className="animate-spin" />
                        جاري الحفظ تلقائياً...
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/5 rounded-full text-xs font-bold text-green-600 dark:text-green-400 border border-green-500/10">
                        <CheckCircle2 size={12} />
                        الإعدادات محفوظة
                    </div>
                )}
            </header>

            <div className="space-y-8">
                {/* Communication Channels */}
                <section className="space-y-4">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">قنوات التواصل</h3>
                    <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-sm divide-y divide-border/40">
                        <NotificationToggle
                            icon={Mail}
                            title="البريد الإلكتروني"
                            description="استلام ملخصات أسبوعية وتحديثات هامة عبر البريد الإلكتروني"
                            checked={preferences?.email_notifications || false}
                            onCheckedChange={(val) => handleToggle('email_notifications', val)}
                        />
                        <NotificationToggle
                            icon={Smartphone}
                            title="إشعارات التطبيق"
                            description="الحصول على تنبيهات فورية على جهازك عند حدوث أي تفاعل"
                            checked={preferences?.push_notifications || false}
                            onCheckedChange={(val) => handleToggle('push_notifications', val)}
                        />
                    </div>
                </section>

                {/* Notification Types */}
                <section className="space-y-4">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">أنواع الأنشطة</h3>
                    <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-sm divide-y divide-border/40">
                        <NotificationToggle
                            title="مراجعات جديدة"
                            description="عندما يضيف مستخدم آخر مراجعة لصورة أو مكان في مفضلتك"
                            checked={preferences?.notify_new_reviews || false}
                            onCheckedChange={(val) => handleToggle('notify_new_reviews', val)}
                        />
                        <NotificationToggle
                            title="الردود على مراجعاتك"
                            description="تنبيهك عندما يتم الرد على أحد مراجعاتك من قبل صاحب المكان أو المستخدمين"
                            checked={preferences?.notify_review_replies || false}
                            onCheckedChange={(val) => handleToggle('notify_review_replies', val)}
                        />
                        <NotificationToggle
                            title="تحديثات الأماكن المفضلة"
                            description="عند تغيير ساعات العمل أو إضافة خدمات جديدة للأماكن التي تتابعها"
                            checked={preferences?.notify_favorite_updates || false}
                            onCheckedChange={(val) => handleToggle('notify_favorite_updates', val)}
                        />
                        <NotificationToggle
                            title="أمان الحساب"
                            description="تنبيهات تسجيل الدخول من أجهزة جديدة أو تغيير كلمة المرور"
                            checked={preferences?.notify_account_changes || false}
                            onCheckedChange={(val) => handleToggle('notify_account_changes', val)}
                        />
                        <NotificationToggle
                            title="العروض والأخبار"
                            description="آخر العروض الحصرية والفعاليات القادمة في السويس"
                            checked={preferences?.notify_marketing || false}
                            onCheckedChange={(val) => handleToggle('notify_marketing', val)}
                        />
                    </div>
                </section>
            </div>
        </div>
    )
}

function NotificationToggle({ icon: Icon, title, description, checked, onCheckedChange }: any) {
    return (
        <label className="flex items-center justify-between p-6 hover:bg-muted/30 transition-colors cursor-pointer group">
            <div className="flex items-start gap-4">
                {Icon && (
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Icon size={20} />
                    </div>
                )}
                <div className="space-y-0.5">
                    <p className="font-bold text-base">{title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">{description}</p>
                </div>
            </div>
            <Switch
                checked={checked}
                onCheckedChange={onCheckedChange}
                className="data-[state=checked]:bg-primary"
            />
        </label>
    )
}
