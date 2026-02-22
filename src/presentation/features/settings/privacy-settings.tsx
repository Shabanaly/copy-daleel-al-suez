'use client'

import { Eye, Shield, Globe, Lock, Info, Check } from 'lucide-react'
import { Switch } from '@/presentation/ui/switch'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { toggleCommunityPrivacyAction, getProfilePrivacyAction } from '@/actions/profile-privacy.actions'
import { toast } from 'sonner'

export function PrivacySettings() {
    const [showName, setShowName] = useState(true)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadPrivacy() {
            const res = await getProfilePrivacyAction()
            if (res.success && res.data !== null) {
                setShowName(res.data as boolean)
            }
            setLoading(false)
        }
        loadPrivacy()
    }, [])

    const handleToggleCommunityPrivacy = async (checked: boolean) => {
        const previous = showName
        setShowName(checked)
        try {
            await toggleCommunityPrivacyAction(checked)
            toast.success("تم تحديث إعدادات الخصوصية")
        } catch (error) {
            setShowName(previous)
            toast.error("فشل التحديث")
        }
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <header className="space-y-1">
                <h2 className="text-2xl font-bold">الخصوصية والظهور</h2>
                <p className="text-muted-foreground text-sm">تحكم في من يمكنه رؤية نشاطك ومعلوماتك على المنصة</p>
            </header>

            <div className="space-y-8">
                {/* Profile Visibility */}
                <section className="space-y-4">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">ظهور الملف الشخصي</h3>
                    <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-sm divide-y divide-border/40">
                        <PrivacyToggle
                            icon={Eye}
                            title="ظهور الاسم في المجتمع"
                            description="إظهار اسمك الحقيقي عند طرح الأسئلة أو الإجابة عليها. إذا تم الإيقاف سيظهر اسم 'مستخدم دليل السويس'"
                            checked={showName}
                            onChange={handleToggleCommunityPrivacy}
                            disabled={loading}
                        />
                        <PrivacyToggle
                            icon={Globe}
                            title="الظهور في نتائج البحث"
                            description="إظهار اسمك في محركات البحث مثل جوجل عند البحث عن مراجعاتك"
                            checked={false}
                        />
                    </div>
                </section>

                {/* Data Privacy */}
                <section className="space-y-4">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">البيانات والحماية</h3>
                    <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-sm divide-y divide-border/40">
                        <PrivacyToggle
                            icon={Lock}
                            title="حفظ بيانات التصفح"
                            description="نستخدم هذه البيانات لتحسين توصيات الأماكن والفعاليات المناسبة لك"
                            checked={true}
                        />
                        <PrivacyToggle
                            icon={Shield}
                            title="مشاركة البيانات مع شركاء الخدمة"
                            description="مشاركة معلومات مجهولة المصدر مع أصحاب المحلات لتحسين جودة خدماتهم"
                            checked={false}
                        />
                    </div>
                </section>

                <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center text-primary shadow-lg order-2 sm:order-1">
                        <Info size={32} />
                    </div>
                    <div className="flex-1 space-y-1 order-1 sm:order-2 text-center sm:text-right">
                        <h4 className="font-bold text-lg">التزامنا بخصوصيتك</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            نحن في دليل السويس لا نقوم ببيع بياناتك الشخصية لأي جهة خارجية. كافة المعلومات التي نجمعها تستخدم حصرياً لتحسين تجربتك داخل المنصة وتأمين حسابك.
                        </p>
                    </div>
                </div>

                <div className="flex justify-center pt-2">
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Shield size={12} />
                        جميع بياناتك مشفرة ومحمية وفقاً لأحدث المعايير الدولية
                    </p>
                </div>
            </div>
        </div>
    )
}

function PrivacyToggle({ icon: Icon, title, description, checked, onChange, disabled }: any) {
    return (
        <label className={cn(
            "flex items-center justify-between p-6 hover:bg-muted/30 transition-colors cursor-pointer group",
            disabled && "opacity-50 cursor-not-allowed"
        )}>
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Icon size={20} />
                </div>
                <div className="space-y-0.5">
                    <p className="font-bold text-base">{title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">{description}</p>
                </div>
            </div>
            <Switch
                checked={checked}
                onCheckedChange={onChange}
                disabled={disabled}
                className="data-[state=checked]:bg-primary"
            />
        </label>
    )
}
