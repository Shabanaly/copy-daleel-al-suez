'use client'

import { useState, useEffect } from 'react'
import { Loader2, Bell, Mail, Smartphone, RefreshCw } from 'lucide-react'
import { Switch } from '@/presentation/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/card'
import { Label } from '@/presentation/ui/label'
import { getNotificationPreferences, updateNotificationPreferences } from '@/actions/notification-preferences.actions'
import { toast } from 'sonner'

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
            toast.error(error instanceof Error ? error.message : 'فشل حفظ الإعدادات')
            toast.error('فشل تحميل التفضيلات')
        } finally {
            setLoading(false)
        }
    }

    const handleToggle = async (key: string, value: boolean) => {
        if (!preferences) return

        // Optimistic update
        const oldPreferences = { ...preferences }
        const newPreferences = { ...preferences, [key]: value } as NotificationPreferences

        setPreferences(newPreferences)
        setSaving(true)

        try {
            await updateNotificationPreferences(newPreferences as unknown as Record<string, unknown>)
            // toast.success('تم تحديث التفضيلات')
        } catch (error) {
            setPreferences(oldPreferences) // Revert on error
            toast.error(error instanceof Error ? error.message : 'فشل تحديث التفضيلات')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold mb-2">إعدادات الإشعارات</h2>
                <p className="text-muted-foreground">تحكم في الإشعارات التي تصلك منا</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" />
                        <CardTitle>قنوات التواصل</CardTitle>
                    </div>
                    <CardDescription>اختر الوسائل التي تفضل استلام الإشعارات عبرها</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <Label htmlFor="email_notifications" className="flex flex-col space-y-1">
                                <span>البريد الإلكتروني</span>
                                <span className="font-normal text-xs text-muted-foreground">استلام ملخصات وتحديثات عبر البريد</span>
                            </Label>
                        </div>
                        <Switch
                            id="email_notifications"
                            checked={preferences?.email_notifications || false}
                            onCheckedChange={(checked: boolean) => handleToggle('email_notifications', checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                            <Label htmlFor="push_notifications" className="flex flex-col space-y-1">
                                <span>إشعارات التطبيق</span>
                                <span className="font-normal text-xs text-muted-foreground">إشعارات فورية داخل المتصفح/التطبيق</span>
                            </Label>
                        </div>
                        <Switch
                            id="push_notifications"
                            checked={preferences?.push_notifications || false}
                            onCheckedChange={(checked: boolean) => handleToggle('push_notifications', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>ننوع الإشعارات</CardTitle>
                    <CardDescription>حدد الأنشطة التي تهمك</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="notify_new_reviews" className="flex flex-col space-y-1">
                            <span>مراجعات جديدة</span>
                            <span className="font-normal text-xs text-muted-foreground">عندما يضيف شخص مراجعة لأماكنك المفضلة</span>
                        </Label>
                        <Switch
                            id="notify_new_reviews"
                            checked={preferences?.notify_new_reviews || false}
                            onCheckedChange={(checked: boolean) => handleToggle('notify_new_reviews', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="notify_review_replies" className="flex flex-col space-y-1">
                            <span>الردود على مراجعاتك</span>
                            <span className="font-normal text-xs text-muted-foreground">عندما يرد صاحب مكان أو مستخدم على مراجعتك</span>
                        </Label>
                        <Switch
                            id="notify_review_replies"
                            checked={preferences?.notify_review_replies || false}
                            onCheckedChange={(checked: boolean) => handleToggle('notify_review_replies', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="notify_favorite_updates" className="flex flex-col space-y-1">
                            <span>تحديثات المفضلة</span>
                            <span className="font-normal text-xs text-muted-foreground">تغييرات في مواعيد عمل أو تفاصيل أماكنك المفضلة</span>
                        </Label>
                        <Switch
                            id="notify_favorite_updates"
                            checked={preferences?.notify_favorite_updates || false}
                            onCheckedChange={(checked: boolean) => handleToggle('notify_favorite_updates', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="notify_account_changes" className="flex flex-col space-y-1">
                            <span>أمان الحساب</span>
                            <span className="font-normal text-xs text-muted-foreground">تنبيهات تسجيل الدخول وتغييرات كلمة المرور (موصى به)</span>
                        </Label>
                        <Switch
                            id="notify_account_changes"
                            checked={preferences?.notify_account_changes || false}
                            onCheckedChange={(checked: boolean) => handleToggle('notify_account_changes', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="notify_marketing" className="flex flex-col space-y-1">
                            <span>أخبار وعروض</span>
                            <span className="font-normal text-xs text-muted-foreground">آخر أخبار دليل السويس والعروض الحصرية</span>
                        </Label>
                        <Switch
                            id="notify_marketing"
                            checked={preferences?.notify_marketing || false}
                            onCheckedChange={(checked: boolean) => handleToggle('notify_marketing', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                {saving && <span className="text-sm text-muted-foreground flex items-center gap-1"><RefreshCw className="h-3 w-3 animate-spin" /> جاري الحفظ...</span>}
            </div>
        </div>
    )
}
